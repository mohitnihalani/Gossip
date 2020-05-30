import React from 'react';
import gql from 'graphql-tag';
import { useCallback} from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import ChatNavbar from './ChatNavbar';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import { History } from 'history';
import * as queries from '../../graphql/queries';
import * as fragments from '../../graphql/fragments';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';


const Container = styled.div`
  background: url(/assets/chat-background.jpg);
  display: flex;
  flex-flow: column;
  height: 100vh;
`;

const getChatQuery = gql`
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      ...FullChat
    }
  }
  ${fragments.fullChat}
`;

const addMessageMutation = gql`
  mutation AddMessage($chatId: ID!, $content: String!){
    addMessage(chatId: ID, content: $content){
      ...Message
    }
  }
  ${fragments.message}
`
interface ChatRoomScreenParams {
    chatId: string;
    history: History;
  }
   
export interface ChatQueryMessage {
    id: string;
    content: string;
    createdAt: Date;
}
   
export interface ChatQueryResult {
  id: string;
  name: string;
  picture: string;
  messages: Array<ChatQueryMessage>;
}

type OptionalChatQueryResult = ChatQueryResult | null;

interface ChatsResult {
  chats: any[]
}

const ChatRoomScreen: React.FC<ChatRoomScreenParams> = ({chatId,history}) => {

  const { data } = useQuery<any>(getChatQuery,{
    variables: {chatId},
  });
  
  const chat = data?.chat;

  const [addMessage] = useMutation(addMessageMutation);

  const onSendMessage = useCallback((content: string)=>{
    addMessage({
      variables: { chatId, content },
      optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          __typename: 'Message',
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          content,
        },
      },
      update: (client, { data }) => {
        if (data && data.addMessage) {

          type FullChat = {[key: string]: any};
          let fullChat;

          const chatIdFromStore = defaultDataIdFromObject(chat);

          if (chatIdFromStore === null) {
            return;
          }

          try {
            fullChat = client.readFragment<FullChat>({
              id: chatIdFromStore,
              fragment: fragments.fullChat,
              fragmentName: 'FullChat',
            });
          } catch (e){
            return;
          }

          if(fullChat === null || fullChat.messages === null || data === null || data.addMessage === null ||  data.addMessage.id === null){
            return;
          }

          if (fullChat.messages.some((currentMessage: any) => currentMessage.id === data.addMessage.id)){
            return;
          }

          fullChat.messages.push(data.addMessage);
          fullChat.lastMessage = data.addMessage;

          client.writeFragment({
            id: chatIdFromStore,
            fragment: fragments.fullChat,
            fragmentName: 'FullChat',
            data: fullChat,
          });
        }

        let clientChatsData;

        try {
          clientChatsData = client.readQuery<ChatsResult>({
            query: queries.chats,
          })
        } catch (e) {
          return;
        }

        if (!clientChatsData || clientChatsData === null) {
          return null;
        }
        if (!clientChatsData.chats || clientChatsData.chats === undefined) {
          return null;
        }
        const chats = clientChatsData.chats;

        const chatIndex = chats.find((currentChat: any) => currentChat.ID === chatId);
        if(chatIndex === -1) return;

        const chatWhereAdded = chats[chatIndex];

        chatWhereAdded.lastMessage = data.addMessage;
        chats.splice(chatIndex, 1);
        chats.unshift(chatWhereAdded);

        client.writeQuery({
          query: queries.chats,
          data: { chats: chats },
        });
         
      },
    });
  },[chat, chatId, addMessage]);
   

    
    if(!chat) return null;
    
    return (
      <Container>
        <ChatNavbar chat={chat} history={history} />
          {chat.messages && <MessagesList messages={chat.messages} />}
        <MessageInput onSendMessage={onSendMessage}/>
      </Container>
    );
};

export default ChatRoomScreen
