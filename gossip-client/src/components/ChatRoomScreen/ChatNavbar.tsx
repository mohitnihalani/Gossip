import React from 'react';
import { useCallback } from 'react';
import {History} from 'history';
import { ChatQueryResult } from './index';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const Container = styled(Toolbar)`
  padding: 0;
  display: flex;
  flex-direction: row;
  background-color: var(--primary-bg);
  color: var(--primary-text);
`;

const BackButton = styled(Button)`
  svg {
    color: var(--primary-text);
  }
`;

const Picture = styled.img`
  height: 40px;
  width: 40px;
  margin-top: 3px;
  margin-left: -22px;
  object-fit: cover;
  padding: 5px;
  border-radius: 50%;
`;
 
const Name = styled.div`
  line-height: 56px;
`;

interface ChatNavbarProps{
    history: History,
    chat: ChatQueryResult;
}
const ChatNavbar: React.FC<ChatNavbarProps> = ({ chat, history }) =>{
    const navBack = useCallback(() => {
        history.push('/chats');
    },[history]);
    return (
      <Container>
        <BackButton onClick={navBack}>
          <ArrowBackIcon />
        </BackButton>
        <Picture src={chat.picture} />
        <Name>{chat.name}</Name>
      </Container>
    );
};

export default ChatNavbar;
