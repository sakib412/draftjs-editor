import React, { useRef, useState } from 'react';
import Editor from '@draft-js-plugins/editor';
import PrismDecorator from './prismjs';
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';
import createImagePlugin from '@draft-js-plugins/image';
import { EditorState, convertFromRaw, RichUtils, AtomicBlockUtils } from 'draft-js';


function App() {


  var contentState = convertFromRaw({
    entityMap: {
      0: {
        type: 'IMAGE',
        mutability: 'IMMUTABLE',
        data: {
          src: 'https://www.draft-js-plugins.com/images/canada-landscape-small.jpg',
        },
      },
    },
    blocks: [
      {
        type: 'header-one',
        text: 'Demo for draft-js-prism'
      },
      {
        type: 'atomic',
        text: ' ',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [
          {
            offset: 0,
            length: 1,
            key: 0,
          },
        ],
      },
      {
        type: 'unstyled',
        text: 'Type some JavaScript below:'
      },
      {
        type: 'code-block',
        text: 'var message = "This is awesome!";'
      }
    ]
  })
  var decorator = new PrismDecorator({
    getSyntax: function () { return 'javascript' }
  });






  const prismPlugin = () => {
    return {
      decorators: [
        new PrismDecorator({
          prism: Prism,
          getSyntax(block) {
            return 'javascript'
          },
        }),
      ],
    };
  };
  const imagePlugin = createImagePlugin();

  const insertImage = (editorState, base64) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "image",
      "IMMUTABLE",
      { src: base64 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
  };
  const handleClick = () => {
    // const base64 = "https://www.draft-js-plugins.com/images/canada-landscape-small.jpg";
    const base64 = window.prompt();
    const newEditorState = insertImage(editorState, base64);
    setEditorState(newEditorState);
  };



  const [editorState, setEditorState] = useState(
    () => EditorState.createWithContent(contentState),
  );
  const editor = useRef(null)
  // If the user changes block type before entering any text, we can
  // either style the placeholder or hide it. Let's just hide it now.
  let className = 'RichEditor-editor';
  contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }
  const focus = () => editor.current.focus();

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  }

  const toggleBlockType = (blockType) => {
    setEditorState(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  }

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    );
  }

  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      // case 'code-block':
      //   const key = block.getKey()
      //   const data = block.getData().merge({ language: 'javascript' });
      //   // console.log(data, newBlock)
      //   const currentContent = editorState.getCurrentContent()
      //   const newContentState = currentContent.merge({
      //     blockMap: block.getData().set(key, data),
      //     selectionAfter: editorState.getSelection()
      //   })
      //   console.log(newContentState)
      //   // setEditorState(EditorState.push(editorState, newContentState, "code-block"))
      //   break
      default: return null;
    }
  }
  return (
    <div className="RichEditor-root">
      <div onClick={handleClick}>
        Insert image
      </div>

      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
      />
      <div className={className} onClick={focus}>

        <Editor
          plugins={[prismPlugin, imagePlugin]}
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          ref={editor}
        />
      </div>
    </div>
  );
}

export default App;


// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};



var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];


const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};




class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}


const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};
