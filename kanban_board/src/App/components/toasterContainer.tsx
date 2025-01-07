import React from 'react';
import { toast } from 'react-toastify';

const Example: React.FC = () => {
  const notify = (): void => {
    toast.success('This is a success message!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  return <button onClick={notify}>Show Toast</button>;
};

export default Example;
