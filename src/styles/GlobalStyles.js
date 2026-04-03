import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  @import url("https://fonts.googleapis.com/css2?family=Lilita+One&display=swap");

  :root {
      color-scheme: light;
      font-family: "Lilita One", system-ui, sans-serif;
      background: #f8fafc;
      color: #0f172a;
  }

  * {
      box-sizing: border-box;
  }

  html,
  body,
  #root {
      min-height: 100%;
  }

  body {
      margin: 0;
      background-color: #0049c4;
  }

  button,
  select,
  input,
  textarea {
      font: inherit;
  }

  @keyframes fadeIn {
      from {
          opacity: 0;
          transform: translateY(5px);
      }
      to {
          opacity: 1;
          transform: translateY(0);
      }
  }
`;
