import React from 'react';
import ReactDOM from 'react-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import ChatsList from './ChatsList';

describe('ChatsList', () => {
    afterEach(cleanup);
   
    it('renders fetched chats data', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          data: {
            chats: [
              {
                id: 1,
                name: 'Foo Bar',
                picture: 'https://localhost:4000/picture.jpg',
                lastMessage: {
                  id: 1,
                  content: 'Hello',
                  createdAt: new Date('1 Jan 2019 GMT'),
                },
              },
            ],
          },
        })
      );
   
      {
        const { container, getByTestId } = render(<ChatsList />);
   
        await waitFor(() => container);
   
        expect(getByTestId('name')).toHaveTextContent('Foo Bar');
        expect(getByTestId('picture')).toHaveAttribute(
          'src',
          'https://localhost:4000/picture.jpg'
        );
        expect(getByTestId('content')).toHaveTextContent('Hello');
        expect(getByTestId('date')).toHaveTextContent('00:00');
      }
    });
  });

  /**
   * 1. Mock the response to contain a fake chat, so we won't need to make an 
   * actual call to our GraphQL API.
   * 2. Create a new instance of <ChatsList />and render it in a container element.
   * 3. We will wait for changes in the DOM caused by setState().
   * 4. We will test the contents of the container.
   */