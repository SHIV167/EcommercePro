import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE editor configuration options
const editorConfig = {
  height: 400,
  menubar: true,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | image | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  image_title: true,
  automatic_uploads: true,
  file_picker_types: 'image',
  file_picker_callback: function (
    cb: (url: string, meta?: { title: string }) => void, 
    value: string, 
    meta: { filetype: string }
  ) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = function () {
      const file = (this as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function () {
        // Create a blob URL
        const blobUrl = URL.createObjectURL(file);
        // Call the callback and populate the Title field with the file name
        cb(blobUrl, { title: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }
};

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, onChange }) => {
  return (
    <div className="border border-input rounded-md mt-1.5">
      <Editor
        apiKey="no-api-key"
        init={editorConfig}
        value={content}
        onEditorChange={(newContent: string) => onChange(newContent)}
      />
    </div>
  );
};

export default BlogEditor;
