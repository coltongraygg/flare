import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { Application, extend, useAssets } from '@pixi/react';
import {
  Container,
  Graphics,
  Sprite,
  Texture,
  Assets,
  NineSliceSprite,
  Text,
  TextStyle,
} from 'pixi.js';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AnimatedList } from '../../components/ui/animated-list';
import MagicCard from '../../components/ui/magicCard';
import { InteractiveHoverButton } from '../../components/ui/interactive-hover-button';
import MsgBox from '../components/chatroom/MsgBox';

// 'extend' is unique to the beta version of pixi.js
// With this beta version, everything you import from pixijs
// must be passed into extend. Then you can utilize them as components
// prefixed with pixi ex. <pixiContainer/> <pixiGraphics/>

extend({
  Container,
  Graphics,
  Sprite,
  Texture,
  NineSliceSprite,
  Text,
  TextStyle,
});

const socket = io('http://localhost:4000');
const style = new TextStyle({
  align: 'center',
  fontFamily: 'sans-serif',
  fontSize: 15,
  fontWeight: 'bold',
  fill: '#000000',
  stroke: '#eef1f5',
  letterSpacing: 5,
  wordWrap: true,
  wordWrapWidth: 350,
});

function Chatroom() {
  // useAssets is how images are loaded into Application via PIXI API requests
  useAssets([
    {
      alias: 'bunny',
      src: 'https://pixijs.com/assets/bunny.png',
    },
    {
      alias: 'speech',
      src: 'https://pixijs.io/pixi-react/img/speech-bubble.png',
    },
  ]);


  
  // Temporary variables for collision detection testing
  const [playerY, setPlayerY] = useState(0);
  const [playerX, setPlayerX] = useState(0);
  const [playerPosition, setPlayerPosition] = useState([playerY, playerX]);

  // An array of every player connected to the chatroom
  const [allPlayers, setAllPlayers] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [gameHeight, setGameHeight] = useState(window.innerHeight);
  
  const displayMessage = (msg: string) => {
    setAllMessages((prevMessages) => [...prevMessages, msg]);
  };
  
  // useCallback works for drawing circle
  const drawCallback = useCallback((graphics: unknown) => {
    graphics?.texture(Assets.get('speech'), 0xffffff, 10, -200, 180);
    graphics?.scale.set(1.5, 0.5);
  }, []);

  // Controls movement by updating the state on the server
  const keyPress = ({ key }: Element) => {
    if (isTyping === false) {
      if (key === 'ArrowUp' || key === 'w') {
        socket.emit('keyPress', { inputId: 'Up', state: true });
      } else if (key === 'ArrowDown' || key === 's') {
        socket.emit('keyPress', { inputId: 'Down', state: true });
      } else if (key === 'ArrowLeft' || key === 'a') {
        socket.emit('keyPress', { inputId: 'Left', state: true });
      } else if (key === 'ArrowRight' || key === 'd') {
        socket.emit('keyPress', { inputId: 'Right', state: true });
      }
    }
  };

  const keyUp = ({ key }: Element) => {
    if (key === 'ArrowUp' || key === 'w') {
      // Up
      socket.emit('keyPress', { inputId: 'Up', state: false });
    } else if (key === 'ArrowDown' || key === 's') {
      // Down
      socket.emit('keyPress', { inputId: 'Down', state: false });
    } else if (key === 'ArrowLeft' || key === 'a') {
      // Left
      socket.emit('keyPress', { inputId: 'Left', state: false });
    } else if (key === 'ArrowRight' || key === 'd') {
      // Right
      socket.emit('keyPress', { inputId: 'Right', state: false });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setGameWidth(window.innerWidth);
      setGameHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Player has joined chat

    // Set the current endpoint to the 'room' for the sockets
    // vs
    // Pass the current endpoint's path of 'chatroom_id' in as data for this socket
    socket.emit('joinChat');
    /**
     * When you join the chat, you need to be assigned a room.
     *
     *  Send a get request to 'chatroom' along with the current path endpoint as a param
     *
     *  The get request will return a chatroom map. set the state to the current room map
     *
     *
     *
     * */
    socket.on('message', (msg) => {
      displayMessage(msg);
      // Update UI with the new message
    });
    // Update state of all players and their respective positions
    socket.on('newPositions', (data) => {
      let allPlayerInfo = [];
      for (let i = 0; i < data.length; i++) {
        allPlayerInfo.push({
          id: data[i].id,
          x: data[i].x,
          y: data[i].y,
          sentMessage: data[i].sentMessage,
          currentMessage: data[i].currentMessage,
        });
      }
      setAllPlayers(allPlayerInfo);
    });
  }, []);

  // When the player is typing, remove event listeners for movement
  useEffect(() => {
    const handleInputChange = (event) => {
      console.log('Input changed:', event.target.value);
    };
    if (isTyping === false) {
      document.addEventListener('keydown', keyPress);
      document.addEventListener('keyup', keyUp);
    } else {
      document.removeEventListener('keydown', keyPress);
      document.removeEventListener('keyup', keyUp);
    }
    return () => {
      document.removeEventListener('keydown', keyPress);
      document.removeEventListener('keyup', keyUp);
    };
  }, [ isTyping ]);

  const sendMessage = () => {
    socket.emit('message', message);
    displayMessage(message);
    setMessage('');
  };
  // Changes when div containing typing is clicked
  const typing = async () => {
    await setIsTyping(!isTyping);
  };

  const drawCircle = (graphics: unknown) => {
    graphics?.clear();
    graphics?.circle(100, 100, 50);
    graphics?.fill('red');
  };

  return (
    <div>
      <div style={{ width: { gameWidth }, height: { gameHeight } }}>
        <Application>
          <pixiContainer x={100} y={200}>
            <pixiGraphics draw={drawCircle} />
          </pixiContainer>
          {allPlayers.map((player) => (
            <pixiContainer x={player.x} y={player.y} key={player.id}>
              {player.sentMessage && <pixiGraphics draw={drawCallback} />}
              {player.sentMessage && (
                <pixiText
                  text={player.currentMessage}
                  anchor={0.5}
                  x={70}
                  y={-50}
                  style={style}
                />
              )}
              <pixiSprite
                texture={Assets.get('bunny')}
                x={0}
                y={0}
                width={20}
                height={20}
                key={player.id}
              />
            </pixiContainer>
          ))}
        </Application>
      </div>
      <div onClick={typing}>
        <Label> Oi, put a message in stinky!</Label>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <InteractiveHoverButton onClick={sendMessage}>
          Send
        </InteractiveHoverButton>
      </div>
      <div>
        <MagicCard>
          <AnimatedList>
            {allMessages.map((msg) => (
              <MsgBox msg={msg} />
            ))}
          </AnimatedList>
        </MagicCard>
      </div>
    </div>
  );
}

export default Chatroom;
