
const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export const confirmKeyUpHandler = (action, setEditing, setEditText) => (e) => {
  if (![ESCAPE_KEY, ENTER_KEY].includes(e.which)) {
    return;
  }

  setEditing(false);
  setEditText(e.target.value);

  if (e.which === ENTER_KEY) {
    action(e.target.value);
  }
}

