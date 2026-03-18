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


function new_setup() {
    input_search.value = "";
    delay_autocancel_event_of(input_search, "input", get_input_and_update_results_and_mods, 500);
    delay_autocancel_event_of(document.getElementById("lang-chooser"), "click", switch_language_button_trigger, 100);
    delay_autocancel_event_of(document.getElementById("text-get-random"), "click", refresh_random_word, 100);
    delay_autocancel_event_of(document.getElementById("text-go-to-history"), "click", redirect_lore, 100);

    load_wotd();
    update_static_elements_language();
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


    mods.push((lang_sel === "br") ?
        `Palavra base processada: ${res.deconstructed_word?.base}` : 
        `Base word processed: ${res.deconstructed_word?.base}`
    );
    res.deconstructed_word?.prefixes.forEach(e => mods.push(e[lang_sel]));
    res.deconstructed_word?.suffixes.forEach(e => mods.push(e[lang_sel]));

    show_correct_section_based_on_input();
    update_mods_in_listing();
    scroll_handler();
}

function update_mods_in_listing() {
    const mods_el = document.getElementById("modifiers-results");

    mods_el.innerHTML = "";

    mods.forEach(mod => {
        const el = document.createElement("li");
        el.textContent = mod;
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
    location.href = `lore_${lang_sel}.html`;
}

function switch_language_button_trigger() {
    const button = document.getElementById("lang-chooser");

    switch(lang_sel) {
    case "br":
        lang_sel = "us";
        button.textContent = "🇺🇸 US (WIP!)";
        break;
    case "us":
        lang_sel = "br";
        button.textContent = "🇧🇷 BR";
        break;
    }

    update_static_elements_language();
    get_input_and_update_results_and_mods();
    update_language_on_random_word();
    load_wotd();
}

function update_static_elements_language() {
    document.getElementById("text-wotd").textContent = (lang_sel === "br") ? "Palavra do dia" : "Word of the day";
    document.getElementById("text-get-random").textContent = (lang_sel === "br") ? "Buscar palavra aleatória" : "Get random word";
    document.getElementById("text-go-to-history").textContent = (lang_sel === "br") ? "História do idioma" : "History of the language";
    document.getElementById("text-all-words").textContent = (lang_sel === "br") ? "Todas as palavras do dicionário:" : "All words in the dictionary:";
    document.getElementById("text-your-search").textContent = (lang_sel === "br") ? "Resultados da pesquisa:" : "Search results:";
    document.getElementById("text-modifiers-search").textContent = (lang_sel === "br") ? "Possível análise da palavra:" : "Possible analysis on the word:";
    document.getElementById("text-footer").textContent = (lang_sel === "br") ? "Criado por Lohk, 2026" : "Created by Lohk, 2026";
}

function __wotd_random_common_replace(dict_idx, id) {
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



//
//
//function setup() {
//    input_search.value = ""; // reset
//    btn_lang.addEventListener("click", toggle_lang);
//    
//    delay_autocancel_event_of(input_search, "input", search, 500);
//
//    fetch_results();
//    refresh_texts_for_translation();
//    wotd_load();
//    random_button_setup();
//
//    delay_autocancel_event_of(window, "scroll", scroll_handler, 100);
//    setInterval(scroll_handler, 5000);
//    scroll_handler();
//}
//
//
//
//function wotd_load() {
//    const day_code = ((new Date()).getDate() * 864512) % dict.GetLength();
//    const obj = dict.GetIndex(day_code);
//
//    const el = document.getElementById("action-wotd");
//    const new_el = obj.toHTML();
//    new_el.setAttribute("id", "action-wotd");
//
//    el.replaceWith(new_el);
//}
//
//function random_button_setup() {
//    const btn = document.getElementById("text-get-random");
//    btn.addEventListener("click", function() {
//        const sel = Math.floor(Math.random() * dict.GetLength());
//        const obj = dict.GetIndex(sel);
//
//        const el = document.getElementById("action-random");
//        const new_el = obj.toHTML();
//        new_el.setAttribute("id", "action-random");
//
//        el.replaceWith(new_el);
//    })
//}
//
//function search(ev) {
//    const str = ev.target.value;
//
//    const wotd_random = document.getElementById("section-wotd-random");
//    const all_words = document.getElementById("section-all-words");
//    const search_sect = document.getElementById("section-search");
//
//    if (str.length == 0) {
//        wotd_random.style.display = "";
//        all_words.style.display = "";
//        search_sect.style.display = "none";
//
//        fetch_results();
//    }
//    else {
//        wotd_random.style.display = "none";
//        all_words.style.display = "none";
//        search_sect.style.display = "";
//
//        fetch_results();
//    }
//}
//
//function reset_scroll_load() {
//    load_idx = 0;
//    all_listing.innerHTML = "";
//}
//
//function fetch_results() {
//    all_listing = document.getElementById(input_search.value.length === 0 ? "all-results" : "scroll-results");
//    const res = dict.Search(input_search.value);
//
//    //const target = document.getElementById("scroll-results");
//    const mods = document.getElementById("modifiers-results");
//
//    //target.innerHTML = "";
//    mods.innerHTML = "";
//
//    results = [];
//
//    const matches = res.perfect_matches.flatMap(e => e.src).flatMap(e => Object.values(e));
//    const others = res.other_cases.flatMap(e => e.src).flatMap(e => Object.values(e));
//
//    for(let i = 0; i < matches.length; ++i) results.push({key: res.perfect_matches[i].key, obj: matches[i]});
//    for(let i = 0; i < others.length; ++i) results.push({key: res.other_cases[i].key, obj: others[i]});
//
//    reset_scroll_load();
//
//    /*if (input_search.value.length === 0) {
//        return;
//    }
//
//    const matches = res.perfect_matches.flatMap(e => e.src).flatMap(e => Object.values(e));
//
//    for(let i = 0; i < matches.length; ++i) {
//        const el = matches[i].toHTML(res.perfect_matches[i].key);
//        target.appendChild(el);
//    }
//
//    const others = res.other_cases.flatMap(e => e.src).flatMap(e => Object.values(e));
//
//    for(let i = 0; i < others.length; ++i) {
//        const el = others[i].toHTML(res.other_cases[i].key);
//        el.classList.add("minimalist");
//        target.appendChild(el);
//    }*/
//
//    if (input_search.value.length === 0) {
//        scroll_handler();
//        return;
//    }
//
//    function appendToMods(str) {
//        if (!str) return;
//        const el = document.createElement("li");
//        el.textContent = str;
//        mods.appendChild(el);
//    }
//
//    appendToMods((lang_sel === "br") ?
//        `Palavra base processada: ${res.deconstructed_word.base}` : 
//        `Base word processed: ${res.deconstructed_word.base}`
//    );
//
//    res.deconstructed_word.prefixes.forEach(e => appendToMods(e[lang_sel]));
//    res.deconstructed_word.suffixes.forEach(e => appendToMods(e[lang_sel]));
//
//    scroll_handler();
//}
//
//function toggle_lang() {
//    switch(lang_sel) {
//    case "br":
//        lang_sel = "us";
//        btn_lang.textContent = "🇺🇸 US";
//        break;
//    case "us":
//        lang_sel = "br";
//        btn_lang.textContent = "🇧🇷 BR";
//        break;
//    }
//    refresh_texts_for_translation();
//    wotd_load();
//    fetch_results();
//    scroll_handler();
//}
//
//function refresh_texts_for_translation()
//{
//    document.getElementById("text-wotd").textContent = (lang_sel === "br") ? "Palavra do dia" : "Word of the day";
//    document.getElementById("text-get-random").textContent = (lang_sel === "br") ? "Buscar palavra aleatória" : "Get random word";
//    document.getElementById("text-all-words").textContent = (lang_sel === "br") ? "Todas as palavras do dicionário:" : "All words in the dictionary:";
//    document.getElementById("text-your-search").textContent = (lang_sel === "br") ? "Resultados da pesquisa:" : "Search results:";
//    document.getElementById("text-modifiers-search").textContent = (lang_sel === "br") ? "Possível análise da palavra:" : "Possible analysis on the word:";
//    document.getElementById("text-footer").textContent = (lang_sel === "br") ? "Criado por Lohk, 2026" : "Created by Lohk, 2026";
//}
//
//
//function scroll_handler() {
//    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - scroll_y_off_trigger) {
//        for (let max = 0; max < lines_to_load_per_scroll && lines_loaded < results.length; ++max) {
//
//            const obj = results[lines_loaded++];
//            all_listing.appendChild(obj.obj.toHTML(obj.key));
//
//            /*const raw_obj = lines_loaded < source_lines.perfect_matches.length ?
//                source_lines.perfect_matches[lines_loaded].src : 
//                source_lines.other_cases[lines_loaded - source_lines.perfect_matches.length].src;
//            
//            const highlight = lines_loaded < source_lines.perfect_matches.length;
//
//            ++lines_loaded;
//
//            const obj = Object.values(raw_obj)[0];
//            const key = Object.keys(raw_obj)[0];
//
//            const blk = document.createElement("div");
//            blk.classList.add("lsw-frame_gen_soft");
//            if (highlight) blk.classList.add("highlighted");
//
//            blk.appendChild(obj.toHTML(key));
//            all_listing.appendChild(blk);*/
//        }
//
//        /*if (source_lines.other_cases.length + source_lines.perfect_matches.length === 0 && lines_loaded == 0) {
//            ++lines_loaded;
//            const blk = document.createElement("div");
//            blk.classList.add("lsw-frame_gen_soft");
//
//            const p = document.createElement("p");
//            p.innerText = "Sem resultados.";
//
//            blk.appendChild(p);
//            all_listing.appendChild(blk);
//        }*/
//    }
//}
//
//
//setup();


// ============================== TOOLS ============================== //

function delay_autocancel_event_of(element, event_type, fcn, time_delay)
{
    element.addEventListener(event_type, function(ev) {        
        const ev_id = Number(element[`__ev_fcn_${event_type}_id`]);
        if (ev_id) clearTimeout(ev_id);
        element[`__ev_fcn_${event_type}_id`] = setTimeout(function(){ fcn(ev); }, time_delay);
    });
}