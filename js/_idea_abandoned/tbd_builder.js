const main = document.querySelector("main");


const cl_frame = "lsw-frame_gen ";
const cl_center = "lsw-center ";
const cl_title = "lsw-title ";
const cl_headline = "lsw-headline ";
// classes for DIV: lsw-frame_gen, lsw-center 

setTimeout(reset_build_page, 500);

function reset_build_page()
{
    main.innerHTML = "";
}

function __build_from(ref, parentNode)
{
    if (!ref) return;

    for (let i = 0; i < ref.length; ++i) {
        const obj = ref[i];

        const el = document.createElement(obj.type);

        if (obj["class"]) el.setAttribute("class", obj["class"]);
        if (obj["href"]) el.setAttribute("href", obj["href"]);
        if (obj["innerText"]) el.innerText = obj["innerText"];

        if (obj["on"]) {
            const keys = Object.keys(obj["on"]);

            for(let k = 0; k < keys.length; ++k) {
                const fcn = obj["on"][keys[k]];
                el.addEventListener(keys[k], fcn);
            }
        }

        __build_from(obj["children"], el);

        parentNode.appendChild(el);
    }
}

