




main();

function main()
{
    _tie_search_to_put_result();
    _load_wotd_and_random_word_search();
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