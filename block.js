// (function () {
//   "use strict";

//   // Block common DevTools and page-source shortcuts
//   document.addEventListener(
//     "keydown",
//     function (event) {
//       const key = event.key.toLowerCase();

//       if (
//         key === "f12" ||
//         ((event.ctrlKey || event.metaKey) &&
//           event.shiftKey &&
//           ["i", "j", "c"].includes(key)) ||
//         ((event.ctrlKey || event.metaKey) && key === "u")
//       ) {
//         event.preventDefault();
//         event.stopImmediatePropagation();
//         return false;
//       }
//     },
//     true,
//   );

//   // Disable the right-click context menu
//   document.addEventListener(
//     "contextmenu",
//     function (event) {
//       event.preventDefault();
//     },
//     true,
//   );
// })();
