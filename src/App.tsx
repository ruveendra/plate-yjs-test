// Import React dependencies.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
// Import Plate stuff
import { Plate, withPlate, createPlateEditor } from '@udecode/plate'
// Import the Slate editor factory.
import {createEditor, Editor, Descendant, Node, Transforms, Range} from 'slate'
// Import the Slate components and React plugin.
import {Slate, Editable, RenderLeafProps, ReactEditor} from 'slate-react'
// Import the core Slate-Yjs binding
// import {
//   withCursors,
//   withYjs,
//   withYHistory,
//   slateNodesToInsertDelta,
//   YjsEditor
// } from '@slate-yjs/core'
// Import Yjs
import * as Y from 'yjs'
// Import web socket stuff
import { WebsocketProvider } from 'y-websocket'
//import { WebsocketProvider } from './services/y-websocket'
import randomColor from 'randomcolor'
// Local resources
import { AutoScaling } from './AutoScaling'
import { RemoteCursorOverlay } from './RemoteCursorOverlay'
import { withHistory } from "slate-history";

import {
  SyncElement,
  toSharedType,
  useCursors,
  withCursor,
  withYjs,
} from "slate-yjs";

import { withReact } from "slate-react";

//const WEBSOCKET_ENDPOINT = 'wss://dq-websocket-server.herokuapp.com'//'ws://localhost:1234' 
const WEBSOCKET_ENDPOINT = "wss://yjs.atticus.pub" 
//wss://3z1qvnl8p2.execute-api.us-east-1.amazonaws.com/dev
//const WEBSOCKET_ENDPOINT = 'wss://3z1qvnl8p2.execute-api.us-east-1.amazonaws.com/dev'
//const WEBSOCKET_ENDPOINT = 'wss://ec2-52-192-72-131.ap-northeast-1.compute.amazonaws.com:8080'
//const WEBSOCKET_ENDPOINT = 'wss://54.89.208.81'
//const WEBSOCKET_ENDPOINT = 'ws://localhost:1234'
//https://ec2-52-192-72-131.ap-northeast-1.compute.amazonaws.com/


function App() {
  const editableProps = {
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  };

  const initialValue = [
    {
      children: [
        {
          text:
            'This is editable plain text with react and history plugins, just like a <textarea>!',
        },
      ],
    },
  ];

  const [value, setValue] = useState<Descendant[]>([]);

  const name = 'Stephan'
  const color = useMemo(
    () =>
      randomColor({
        luminosity: "dark",
        format: "rgba",
        alpha: 1,
      }),
    []
  );

  // Create the Yjs doc and fetch if it's available from the server
  const chapterId = "doc-slug-fallback";
  // const [sharedTypeContent, provider] = useMemo(() => {
  //   const doc = new Y.Doc();
  //   const sharedTypeContent = doc.get('content', Y.XmlText) as Y.XmlText;
  //   const provider = new WebsocketProvider(WEBSOCKET_ENDPOINT, chapterId, doc, {
  //     connect: false,
  //   });

  //   return [sharedTypeContent, provider];
  // }, []);

  const [sharedType, provider] = useMemo(() => {
    const doc = new Y.Doc();
    const sharedType = doc.getArray<SyncElement>("content");
    //const dbProvider = new IndexeddbPersistence(chapter._id, doc);
   // console.log(YJS_ENDPOINT);
    //console.log("aws io :", aws_io);
    // const provider = new WebsocketProvider("ws://127.0.0.1:1234", chapter._id, doc, {
    // const provider = new WebsocketProvider(YJS_ENDPOINT, chapter._id, doc, {
    //   connect: false,
    //   params :{
    //     sessionId : sessionId,
    //     userId:selectedSocialProfile.userId
    //   }
    // }
    // );
    const provider = new WebsocketProvider(WEBSOCKET_ENDPOINT, chapterId, doc, {
      connect: false,
      
    });

    return [sharedType, provider];
  }, []);




  // Setup the binding
  const editor = useMemo(() => {
    const editor: any = withCursor(
      withYjs(
        withReact(withHistory(createPlateEditor())),
        sharedType
      ),
      provider.awareness
    );
    return editor;
  }, [sharedType, provider]);

  // Disconnect the binding on component unmount in order to free up resources
  // useEffect(() => () => YjsEditor.disconnect(editor), [editor]);
  useEffect(() => {
    /*provider.on("status", ({ status }: { status: string }) => {
      setOnlineState(status === "connected");
    });*/

    provider.awareness.setLocalState({
      alphaColor: color.slice(0, -2) + "0.2)",
      color,
      name,
    });

    // provider.on("sync", (isSynced: boolean) => {
    //   if (isSynced) {
    //     if (sharedTypeContent.length === 0) {
    //       const insertDelta = slateNodesToInsertDelta(initialValue);
    //       sharedTypeContent.applyDelta(insertDelta);
    //     }
    //   }
    // });

    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [color, sharedType, provider]);

  const toolBarHeight = 50
  const documentWidth = 8.5 * 96

  const renderEditable = (editable: React.ReactNode) => {
    return (
      <RemoteCursorOverlay className="flex justify-center my-32 mx-10">
        {editable}
      </RemoteCursorOverlay>
    )
  };

  return (
    <Plate
      id="1"
      editor={editor}
      //value={value}
      onChange={setValue}
      editableProps={editableProps}
      //initialValue={initialValue}
      renderEditable={renderEditable}
    >
    </Plate>
  );
}

export default App;
