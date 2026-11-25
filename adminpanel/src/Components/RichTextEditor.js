import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const editorConfig = {
    licenseKey: 'GPL',
};

function RichTextEditor({ value = '', onChange, editorKey }) {
    return (
        <CKEditor
            key={editorKey}
            editor={ClassicEditor}
            data={value || ''}
            config={editorConfig}
            onChange={(event, editor) => {
                onChange?.(editor.getData());
            }}
        />
    );
}

export default RichTextEditor;
