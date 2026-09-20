const root_el = document.body.parentElement;
//const btn_lang = document.getElementById("lang-chooser");
const input_search = document.getElementById("search-box");

let all_listing = document.getElementById("all-results");
const scroll_y_off_trigger = 800;
const lines_to_load_per_scroll = 10;

let last_random_word = -1;
let lines_loaded = 0;
let results = [];
let mods = [];
let last_lang = "";

function monitorLang() {
    const act = localStorage.getItem("language");
    if (act != last_lang) {
        last_lang = act;
        get_input_and_update_results_and_mods();
        load_wotd();
        update_language_on_random_word();
    }
}

setInterval(monitorLang, 500);


function new_setup() {
    input_search.value = "";
    delay_autocancel_event_of(input_search, "input", get_input_and_update_results_and_mods, 500);
    delay_autocancel_event_of(document.getElementById("text-get-random"), "click", refresh_random_word, 100);
    delay_autocancel_event_of(document.getElementById("text-go-to-history"), "click", redirect_lore, 100);

    load_wotd();
    //update_static_elements_language();
    get_input_and_update_results_and_mods();

    delay_autocancel_event_of(window, "scroll", scroll_handler, 100);
    setInterval(scroll_handler, 5000);
    scroll_handler();
}

// trigger-able on home
function reset_all() {
    input_search.value = "";
    get_input_and_update_results_and_mods();
}

// trigger-able: by input
function get_input_and_update_results_and_mods() {
    const res = dict.Search(input_search.value);

    lines_loaded = 0;
    all_listing = document.getElementById(input_search.value.length === 0 ? "all-results" : "scroll-results");
    all_listing.innerHTML = "";
    results = [];
    mods = [];

    const matches = res.perfect_matches.flatMap(e => e.src).flatMap(e => Object.values(e));
    const others = res.other_cases.flatMap(e => e.src).flatMap(e => Object.values(e));

    for(let i = 0; i < matches.length; ++i) results.push({key: res.perfect_matches[i].key, obj: matches[i]});
    for(let i = 0; i < others.length; ++i) results.push({key: res.other_cases[i].key, obj: others[i]});

    mods.push({
        br: `Palavra base processada: ${res.deconstructed_word?.base}`,
        us: `Base word processed: ${res.deconstructed_word?.base}`
    });

    /*mods.push((lang_sel === "br") ?
        `Palavra base processada: ${res.deconstructed_word?.base}` : 
        `Base word processed: ${res.deconstructed_word?.base}`
    );*/
    res.deconstructed_word?.prefixes.forEach(e => mods.push(e));
    res.deconstructed_word?.suffixes.forEach(e => mods.push(e));

    show_correct_section_based_on_input();
    update_mods_in_listing();
    scroll_handler();
    
    // external
    refreshLanguageTexts();
}

function update_mods_in_listing() {
    const mods_el = document.getElementById("modifiers-results");

    mods_el.innerHTML = "";

    mods.forEach(mod => {
        const el = document.createElement("li");
        el.setAttribute("translate-us", mod.us);
        el.setAttribute("translate-br", mod.br);
        mods_el.appendChild(el);
    });
}

function show_correct_section_based_on_input() {
    const wotd_random = document.getElementById("section-wotd-random");
    const all_words = document.getElementById("section-all-words");
    const search_sect = document.getElementById("section-search");

    if (input_search.value.length == 0) {
        wotd_random.style.display = "";
        all_words.style.display = "";
        search_sect.style.display = "none";
    }
    else {
        wotd_random.style.display = "none";
        all_words.style.display = "none";
        search_sect.style.display = "";
    }
}

// trigger-able: by button
function refresh_random_word() {
    __wotd_random_common_replace((last_random_word = Math.floor(Math.random() * dict.GetLength())), "action-random");
}

function update_language_on_random_word() {
    __wotd_random_common_replace(last_random_word, "action-random");
}

function load_wotd() {
    __wotd_random_common_replace(((new Date()).getDate() * 864512) % dict.GetLength(), "action-wotd");
}

function redirect_lore() {
    location.href = `lore_${localStorage.getItem("language")}.html`;
}

function __wotd_random_common_replace(dict_idx, id) {
    if (dict_idx < 0) {
        console.log("[build.js] too early");
        setTimeout(refresh_random_word, 100);
        return;
    }

    const obj = dict.GetIndex(dict_idx);

    const el = document.getElementById(id);
    const new_el = obj.toHTML();
    new_el.setAttribute("id", id);

    el.replaceWith(new_el);
}


function scroll_handler() {
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - scroll_y_off_trigger) {
        for (let max = 0; max < lines_to_load_per_scroll && lines_loaded < results.length; ++max) {
            const obj = results[lines_loaded++];
            all_listing.appendChild(obj.obj.toHTML(obj.key));
        }
    }
}

new_setup();



// ============================== TOOLS ============================== //

function delay_autocancel_event_of(element, event_type, fcn, time_delay)
{
    element.addEventListener(event_type, function(ev) {        
        const ev_id = Number(element[`__ev_fcn_${event_type}_id`]);
        if (ev_id) clearTimeout(ev_id);
        element[`__ev_fcn_${event_type}_id`] = setTimeout(function(){ fcn(ev); }, time_delay);
    });
}