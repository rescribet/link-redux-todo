import React from 'react'

const ButtonWithFeedback = ({
  children,
  className,
  doneText,
  workingText,
  onClick,
  ...other
}) => {
  const [ working, setWorking ] = React.useState(false);
  const [ done, setDone ] = React.useState(false);

  React.useEffect(() => {
    let timeout = null;
    if (done) {
      timeout = setTimeout(() => {
        setDone(false);
      }, 2000);
    } else if (done) {
      clearTimeout(timeout);
    }
    return () => clearTimeout(timeout);
  }, [done]);

  return (
    <button
      className={className}
      disabled={working}
      onClick={() => {
        setWorking(true);
        try {
          onClick();
        } finally {
          setDone(true);
          setWorking(false);
        }
      }}
      {...other}
    >
      {done ? doneText : (working ? workingText : children)}
    </button>
  )
}

export default ButtonWithFeedback;
