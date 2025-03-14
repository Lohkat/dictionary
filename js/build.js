const scroll_y_off_trigger = 500;
const lines_to_load_per_scroll = 50;
const list_target_id = "main";
let lines_loaded = 0;

main();

function main()
{
    _tie_search_to_put_result();
    _load_wotd_and_random_word_search();

    try { document.fonts.ready.then(remove_filter_font); } catch(e) { setTimeout(remove_filter_font, 100); }
    delay_autocancel_event_of(window, "scroll", scroll_handler, 100);
    setInterval(scroll_handler, 100);
}


function _tie_search_to_put_result()
{
    const search_el = document.getElementById("search");
    const hide_on_search = document.getElementById("hide_on_search");

    delay_autocancel_event_of(search_el, "input", function(ev) {
        console.log(`searching for ${search_el.value}`);

        hide_on_search.style.display = (search_el.value.length > 0) ? "none" : "block";
    }, 500);

}

function _load_wotd_and_random_word_search()
{
    const wotd_el = document.getElementById("wotd");
    const random_btn_el = document.getElementById("button_random_word");
    const insert_random_el = document.getElementById("insert_random");

    const day_code = ((new Date()).getDate() * 864512) % dict.GetLength();
    const obj = dict.GetIndex(day_code);

    wotd_el.innerHTML = "";
    wotd_el.appendChild(obj.toHTML());

    random_btn_el.addEventListener("click", function(ev) {
        const random_index = Math.floor(Math.random() * dict.GetLength());
        const obj = dict.GetIndex(random_index);

        insert_random_el.innerHTML = "";
        insert_random_el.appendChild(obj.toHTML());
    });

}


function scroll_handler() {
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - scroll_y_off_trigger) {
        for (let max = 0; max < lines_to_load_per_scroll && lines_loaded < dict.GetLength(); ++max) {
            const el_ul = document.getElementById(list_target_id);
            const obj = dict.GetIndex(lines_loaded++);

            const blk = document.createElement("div");
            blk.classList.add("lsw-frame_gen_soft");

            blk.appendChild(obj.toHTML());
            el_ul.appendChild(blk);
        }
    }
}

function remove_filter_font() {
    const els = document.querySelectorAll("[class=\"lsw-font-hidden\"]");
    for(let i = 0; i < els.length; ++i) els[i].classList.remove("lsw-font-hidden");
}



// ============================== TOOLS ============================== //

function delay_autocancel_event_of(element, event_type, fcn, time_delay)
{
    element.addEventListener(event_type, function(ev) {        
        const ev_id = Number(element[`__ev_fcn_${event_type}_id`]);
        if (ev_id) clearTimeout(ev_id);
        element[`__ev_fcn_${event_type}_id`] = setTimeout(function(){ fcn(ev); }, time_delay);
    });
}

function create_dict_elements(of_dict_val)
{
    const dict_obj = (typeof of_dict_val === 'number') ? dict.GetIndex(of_dict_val) : dict.Search(of_dict_val);
}
