import React, { useState } from 'react';
import ImageUploading from 'react-images-uploading';

export default function ImageUploadButton(props)
{
    const onChange = (imageList) =>
    {
        props.setImage(imageList);
    };
    
    return (
    <ImageUploading
      multiple={false}
      value={props.images}
      onChange={onChange}
      dataURLKey="data_url"
    >
      {({ onImageUpload }) => (
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/img/icons/icons8-plus-256.png"
            alt="Upload"
            onClick={onImageUpload}
            className="mr-5 rounded-lg cursor-pointer"
            width="300"
            height="300"
          />
        </div>
      )}
    </ImageUploading>
  );
}
