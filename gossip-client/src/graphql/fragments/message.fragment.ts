import gql from "graphql-tag";

// Represents a message
export default gql`
    fragment Mesage on Message {
        id
        createdAt
        content
    }
`;

