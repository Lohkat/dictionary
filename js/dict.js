const el_search = document.getElementById("search");
const el_sections = document.getElementById("static-sections");
const el_font_toggle = document.getElementById("font_toggle");
const el_html_root = document.getElementById("html_root");
const el_search_result = document.getElementById("search_result");

const scroll_y_off_trigger = 200;
const lines_to_load_per_scroll = 10;
const list_target_id = "list_of_items_target";
let lines_loaded = 0;
let lines_list = [];

setTimeout(setup, 10);
setInterval(scroll_handler, 1000);

try { document.fonts.ready.then(remove_filter_font); } catch(e) { setTimeout(remove_filter_font, 100); }
hold_event_of(window, "scroll", scroll_handler, 100);


function setup() {
    show_sections(true);
    setup_font_toggle();
    hold_event_of(el_search, "keyup", input_handler, 250);
    el_search.addEventListener("keyup", input_handler_quick);
    input_handler(null);
}

function setup_font_toggle() {
    el_font_toggle.addEventListener("click", function() {
        el_html_root.classList.toggle("avali-font");
    });
}

function scroll_handler() {
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - scroll_y_off_trigger) {
        if (lines_loaded < lines_list.length) {
            const el_ul = document.getElementById(list_target_id);
            for(let i = 0; i < lines_to_load_per_scroll && lines_loaded < lines_list.length; ++i) {
                el_ul.innerHTML += lines_list[lines_loaded++];
            }
        }
    }
}

function input_handler(ev) {    
    const last_result = larinuim_REMOVE_MODS(search.value);
    const list = larinuim_FIND_ANY(last_result.l);

    if (list.length == 0)
    {
        el_search_result.innerHTML = "<div class=\"lsw-frame_gen\"><span class=\"lsw-bold lsw-title\">Nenhum resultado</span></div>";
        return;
    }

    let raw_htm = "";

    if (last_result.msg.length > 0) {
        raw_htm += "<div class=\"lsw-frame_gen\">" +
            "<h3 style=\"margin: 0\">Modificadores detectados!</h3>" +
            "<p class=\"lsw-low_indent\">Resultados da pesquisa são para '<span class=\"lsw-bold\">" + last_result.l + "</span>'</p>" +
            "<p class=\"lsw-low_indent\">Os seguintes modificadores foram detectados:</p>" +
            "<ol type=\"1\" class=\"lsw-offset_list_high lsw-low_indent\">";
            
        for (let i = 0; i < last_result.msg.length; ++i) {
            raw_htm += "<li style=\"padding: 0 0 0.4em 0\"><span class=\"lsw-bold\">" + 
                last_result.msg[i][0] + "</span>: " + 
                last_result.msg[i][1] + "</li>";
        }
        
        raw_htm += "</ol></div>";
    }
    
    if (search.value.length === 0) {
        raw_htm += "<div id=\"mark-dictionary\" class=\"lsw-frame_gen\">"+
        "<a href=\"#mark-dictionary\"><h2 class=\"lsw-title\">Dicionário</h2></a>";
    }    
    else {
        raw_htm += "<div class=\"lsw-frame_gen\">" +
            "<span class=\"lsw-bold\">" + (list.length) + (list.length > 1 ? " resultados encontrados" : " resultado encontrado") + ":</span>";
        
        if (Math.random() * 1000 > 800) raw_htm += "<br/><span class=\"lsw-italic\">Dica: colocar \"exact:\" antes de escrever pesquisará apenas por palavras em Larinuim! Sabia disso?</span><br/>";
    }
    
    raw_htm += `<ul class=\"lsw-arrow_list\" id=\"${list_target_id}\">`;

    lines_loaded = 0;
    lines_list = [];
    
    for(let i = 0; i < list.length; ++i) {
        const obj = list[i];
        if (!obj) continue;
        
        let each_htm = "<li id=\"ref_word-" + obj.l + "\"><a href=\"#ref_word-" + obj.l + "\" class=\"lsw-bold\" style=\"text-decoration: underline; font-size: 1.2em" + (obj["discontinued"] === true ? "; color: red" : "") + "\">" + obj.l + ":</a>";
        
        for(let j = 0; j < obj.d.length; ++j) {
            each_htm += "<p class=\"lsw-low_indent\"><span class=\"lsw-bold\">" + (j + 1) + ".</span> " + obj.d[j] + (j+1 === obj.d.length ? "." : ";") + "</p>";
        }
        
        for(let j = 0; obj["e"] != null && j < obj.e.length; ++j) {
            each_htm += "<p class=\"lsw-low_indent\"><span class=\"lsw-bold\">Exemplo #" + (j + 1) + ":</span> <span class=\"lsw-italic\">" + obj.e[j][0] + " </span> ⇒ \"" + obj.e[j][1] + "\"" + (j+1 === obj.e.length ? "." : ";") + "</p>";
        }
        each_htm += "</li>";

        lines_list[lines_list.length] = each_htm;
    }

    raw_htm += "</ul></div>";
    el_search_result.innerHTML = raw_htm;
}

function input_handler_quick(ev) {
    show_sections(el_search.value.length == 0);
}

function show_sections(show) {    
    const is_set = el_sections.children.length > 0;
    if (show) {
        if (!is_set) {
            el_sections.innerHTML = raw_base_sections;
            
            { // WOTD
                const el_wotd = document.getElementById("insert_wotd");
                const day_code = ((new Date()).getDate() * 864512) % larinuim_LENGTH();
                const obj = larinuim_INDEX(day_code);
                el_wotd.innerHTML = _from_obj_idx(obj);
            }
            { // Random Word
                const el_btn_random_word = document.getElementById("button_random_word");
                el_btn_random_word.addEventListener("click", function(ev){
                    const el = document.getElementById("insert_random");                
                    const day_code = Math.floor(Math.random() * larinuim_LENGTH());
                    const obj = larinuim_INDEX(day_code);                
                    el.innerHTML = _from_obj_idx(obj);
                });

            }

            console.log(`Added sections`);
            return;
        }
    }
    el_sections.style.display = show ? "" : "none";
}


function hold_event_of(element, event_type, fcn, time_delay)
{
    element.addEventListener(event_type, function(ev) {        
        const ev_id = Number(element[`__ev_fcn_${event_type}_id`]);
        if (ev_id) clearTimeout(ev_id);
        element[`__ev_fcn_${event_type}_id`] = setTimeout(function(){ fcn(ev); }, time_delay);
    });
}

function remove_filter_font() {
    const els = document.querySelectorAll("[class=\"lsw-font-hidden\"]");
    for(let i = 0; i < els.length; ++i) els[i].classList.remove("lsw-font-hidden");
}

function _from_obj_idx(obj)
{
    let raw_htm = "<ul class=\"lsw-arrow_list\">";
            
    raw_htm += "<li id=\"ref_word-" + obj.l + "\"><a href=\"#ref_word-" + obj.l + "\" class=\"lsw-bold\" style=\"text-decoration: underline; font-size: 1.2em" + (obj["discontinued"] === true ? "; color: red" : "") + "\">" + obj.l + ":</a>";
    
    for(let j = 0; j < obj.d.length; ++j) {
        raw_htm += "<p class=\"lsw-low_indent\"><span class=\"lsw-bold\">" + (j + 1) + ".</span> " + obj.d[j] + (j+1 === obj.d.length ? "." : ";") + "</p>";
    }
    
    for(let j = 0; obj["e"] != null && j < obj.e.length; ++j) {
        raw_htm += "<p class=\"lsw-low_indent\"><span class=\"lsw-bold\">Exemplo #" + (j + 1) + ":</span> <span class=\"lsw-italic\">" + obj.e[j][0] + " </span> ⇒ \"" + obj.e[j][1] + "\"" + (j+1 === obj.e.length ? "." : ";") + "</p>";
    }
    
    raw_htm += "</li></ul>";

    return raw_htm;
}