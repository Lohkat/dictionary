const scroll_y_off_trigger = 500;
const lines_to_load_per_scroll = 50;
const list_target_id = "main";
const search_el = document.getElementById("search");
let lines_loaded = 0;
let source_lines = dict.Search(search_el.value);

main();

function main()
{
    _tie_search_to_put_result();
    _load_wotd_and_random_word_search();

    if (search_el.value.length > 0) hide_on_search.classList.add("lsw-hide");    

    try { document.fonts.ready.then(remove_filter_font); } catch(e) { setTimeout(remove_filter_font, 100); }
    delay_autocancel_event_of(window, "scroll", scroll_handler, 100);
    setInterval(scroll_handler, 5000);
    scroll_handler();
    fill_up_combined_word_if_not_empty();
}

function reset_page()
{
    const el_ul = document.getElementById(list_target_id);

    search_el.value = "";
    el_ul.innerHTML = "";
    source_lines = dict.Search(search_el.value);
    hide_on_search.classList.remove("lsw-hide");
    lines_loaded = 0;
    scroll_handler();
    fill_up_combined_word_if_not_empty();
}


function _tie_search_to_put_result()
{
    const hide_on_search = document.getElementById("hide_on_search");

    delay_autocancel_event_of(search_el, "input", function(ev) {
        console.log(`Searching for ${search_el.value}`);
        
        const el_ul = document.getElementById(list_target_id);

        if (search_el.value.length > 0) {
            hide_on_search.classList.add("lsw-hide");
            
            el_ul.innerHTML = "";
            source_lines = dict.Search(search_el.value);
            lines_loaded = 0;
            scroll_handler();
            fill_up_combined_word_if_not_empty();

            return;
        }
        
        // else restore default:
        reset_page();
    }, 500);
}

function fill_up_combined_word_if_not_empty()
{
    const root = document.getElementById("show_on_combined_word");

    if (source_lines?.deconstructed_word?.prefixes?.length > 0 ||
        source_lines?.deconstructed_word?.suffixes?.length > 0) {
        root.classList.remove("lsw-hide");
    } else {
        root.classList.add("lsw-hide");
        return;
    }

    const base = document.getElementById("base-word");
    const prefixes = document.getElementById("prefixes-word");
    const suffixes = document.getElementById("suffixes-word");

    function make_pair(key, val) {
        const p = document.createElement("p");
        const span = document.createElement("span");

        p.classList.add("lsw-low_indent");
        span.classList.add("lsw-bold");
        span.innerText = key + ": ";
        p.appendChild(span);
        p.appendChild(document.createTextNode(val));
        return p;
    }

    base.innerHTML = "";
    prefixes.innerHTML = "";
    suffixes.innerHTML = "";
    
    base.appendChild(make_pair("Palavra base", source_lines.deconstructed_word.base));
    prefixes.appendChild(make_pair("Prefixos", source_lines.deconstructed_word.prefixes.flatMap(e => e?.[lang_sel]).join(", ") || "nenhum"));
    suffixes.appendChild(make_pair("Sufixos", source_lines.deconstructed_word.suffixes.flatMap(e => e?.[lang_sel]).join(", ") || "nenhum"));
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
        const el_ul = document.getElementById(list_target_id);
        
        for (let max = 0; max < lines_to_load_per_scroll && lines_loaded < (source_lines.other_cases.length + source_lines.perfect_matches.length); ++max) {

            const raw_obj = lines_loaded < source_lines.perfect_matches.length ?
                source_lines.perfect_matches[lines_loaded].src : 
                source_lines.other_cases[lines_loaded - source_lines.perfect_matches.length].src;
            
            const highlight = lines_loaded < source_lines.perfect_matches.length;

            ++lines_loaded;

            const obj = Object.values(raw_obj)[0];
            const key = Object.keys(raw_obj)[0];

            const blk = document.createElement("div");
            blk.classList.add("lsw-frame_gen_soft");
            if (highlight) blk.classList.add("highlighted");

            blk.appendChild(obj.toHTML(key));
            el_ul.appendChild(blk);
        }

        if (source_lines.other_cases.length + source_lines.perfect_matches.length === 0 && lines_loaded == 0) {
            ++lines_loaded;
            const blk = document.createElement("div");
            blk.classList.add("lsw-frame_gen_soft");

            const p = document.createElement("p");
            p.innerText = "Sem resultados.";

            blk.appendChild(p);
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