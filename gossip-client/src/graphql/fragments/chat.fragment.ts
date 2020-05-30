import gql from "graphql-tag";
import message from './message.fragment'

// Represents a chat without message
export default gql`
    fragment Chat on Chat {
        id
        name
        picture
        lastMessage {
            ...Message
        }
    }
    ${message}
`