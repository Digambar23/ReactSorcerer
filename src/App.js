import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw, Modifier, SelectionState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('draftEditorContent');
    if (savedContent) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)));
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('draftEditorContent', contentStateJSON);
  }, [editorState]);

  const onChange = (newEditorState) => {
    let updatedEditorState = newEditorState;
    const contentState = newEditorState.getCurrentContent();
    const contentStateWithFormatting = applyFormatting(contentState);
    if (contentState !== contentStateWithFormatting) {
      updatedEditorState = EditorState.push(newEditorState, contentStateWithFormatting, 'change-block-type');
    }
    setEditorState(updatedEditorState);
  };

  const applyFormatting = (contentState) => {
    let newContentState = contentState;
    const blockMap = contentState.getBlockMap();
    blockMap.forEach((contentBlock) => {
      const blockKey = contentBlock.getKey();
      const blockText = contentBlock.getText();
      if (blockText.startsWith('# ')) {
        newContentState = Modifier.setBlockType(newContentState, new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: blockText.length
        }), 'header-one');
        newContentState = Modifier.replaceText(newContentState, new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: 2
        }), blockText.slice(2));
      } else if (blockText.startsWith('* ')) {
        const selectionState = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: blockText.length
        });
        newContentState = applyInlineStyle(newContentState, selectionState, 'BOLD');
      } else if (blockText.startsWith('** ')) {
        const selectionState = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: blockText.length
        });
        newContentState = applyInlineStyle(newContentState, selectionState, 'COLOR-RED');
      } else if (blockText.startsWith('*** ')) {
        const selectionState = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: blockText.length
        });
        newContentState = applyInlineStyle(newContentState, selectionState, 'UNDERLINE');
      }
    });
    return newContentState;
  };

  const applyInlineStyle = (contentState, selectionState, inlineStyle) => {
    return Modifier.applyInlineStyle(contentState, selectionState, inlineStyle);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('draftEditorContent', contentStateJSON);
    alert('Content saved!');
  };

  const editorStyle = {
    border: '1px solid #ccc',
    minHeight: '200px',
    padding: '10px',
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
        <h2>Title</h2>
        <button onClick={handleSave}>Save</button>
      </div>
      <div style={editorStyle}>
        <Editor
          editorState={editorState}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default MyEditor;
