import { vueMarkupFormatter } from './index.js';

// const input = `
// <div id="header" data-server-rendered>
//   <!--v-if-->
//   <label data-test="input" data-v-1ae75a9f="">
//     Void and Attributes per line Example:
//     <input>
//     <input type="range">
//     <input type="range" max="50">
//     <input type="range" max="50" id="slider">
//   </label>
// <pre
//   class="doxen-code-box"
//   data-applied-style-tokens="codeBox"
//   data-style-tokens="codeBox"
// ><code
//   class="hljs xml"
//   tabindex="0"
// ><span class="hljs-tag">&lt;<span class="hljs-name">DummyButton</span> /&gt;</span></code></pre>
// <pre
//   class="doxen-code-box"
//   data-applied-style-tokens="codeBox"
//   data-style-tokens="codeBox"
// ><code
//   class="hljs javascript"
//   tabindex="0"
// ><span class="hljs-keyword">const</span> dummyButtonProps = {};</code></pre>
//   <p class="">Empty attribute example</p>
//   <div></div>
//   <ul><li><a href="#">Link text on same line</a></li></ul>
// </div>
// `;

const input = `<div>
  <pre>
      Twinkle, twinkle, little star,
      How I wonder what you are.
      Up above the world so high,
      Like a diamond in the sky.
      <p>       Hello       Hello         </p>
  </pre>
  <div>
    <p>  This text will be trimmed.  </p>
  </div>
</div>`;

const result = vueMarkupFormatter(input);


console.log(result);

const output = result;

console.log(input === output);
// console.log('hello');

// const input = `<div>


//   <pre>


//     <span>| | | | |</span>
//   </pre>
//   <div>

//     <h1>| | | | |</h1>

//   </div>
// </div>`;

// const result = vueMarkupFormatter(input);
// console.log(input);
// console.log('----------------------------------------------------');
// const res = input.trim();
// console.log(res);
// console.log(input === res);
// console.log(result);
// console.log(input === result);
// function formatNode() {


// }