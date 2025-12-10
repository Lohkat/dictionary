const UNKNOWN_BASE_LEN = 0;
const PRONOUN_BASE_LEN = 2;
const VERB_BASE_LEN = 3;
const WORD_BASE_LEN = 4;

let lang_sel = "br";

// Affixes are grammatical elements that change the meaning of a word.
const affixes = {    
    prefixes: [
        {
            filter_len: WORD_BASE_LEN,
            cases: [
                {
                    ni: {
                        br: "masculino",
                        us: "male"
                    },
                    na: {
                        br: "feminino",
                        us: "female"
                    }
                }
            ]
        },
        {
            filter_len: VERB_BASE_LEN,
            cases: [
                {
                    ue: {
                        br: "eu",
                        us: "me"
                    },
                    ae: {
                        br: "você (com quem estou falando, próximo, ao meu lado)",
                        us: "you (as of whom I am talking to, near me, by my side)"
                    },
                    pe: {
                        br: "ele/você (externo, ou chamando distante, longe)",
                        us: "him/her/you (external, or distantly called, away)"
                    },
                    ua: {
                        br: "nós (todos os aplicáveis)",
                        us: "us (all applicable)"
                    },
                    sa: {
                        br: "nós (orador e sua turma ou grupo dirigindo-se a outro grupo não incluído)",
                        us: "us (whoever is talking and their group talking to another group not included)"
                    },
                    va: {
                        br: "vocês (próximos num raio pequeno, inclusivo)",
                        us: "you (plural, near, small radius, inclusive)"
                    },
                    ka: {
                        br: "eles (externo ou distante)",
                        us: "them (external or distant)"
                    }
                }
            ]
        }
    ],
    suffixes: [
        {
            filter_len: WORD_BASE_LEN,
            cases: [
                {
                    xi: {
                        br: "diminutivo",
                        us: "diminutive"
                    },
                    xa: {
                        br: "aumentativo",
                        us: "augmentative"
                    }
                }
            ]
        },
        {
            filter_len: VERB_BASE_LEN,
            cases: [
                {
                    pa: {
                        br: "passado",
                        us: "past"
                    },
                    fa: {
                        br: "futuro",
                        us: "future"
                    },
                    ga: {
                        br: "gerúndio",
                        us: "gerund"
                    },
                    la: {
                        br: "particípio",
                        us: "participle"
                    }
                },
                {
                    ku: {
                        br: "substantivado",
                        us: "verbal noun"
                    }
                },
                {
                    xi: {
                        br: "diminutivo",
                        us: "diminutive"
                    },
                    xa: {
                        br: "aumentativo",
                        us: "augmentative"
                    }
                }
            ]
        }
    ],


    DeconstructWord: function(word) {
        if (typeof word !== "string") return null;
        
        const ret = {
            success: false, // if it got to the base length, 3 or 4, this is true
            base: word.toLowerCase(), // the nearest it got to the base, or the base word/verb
            type: word.length > 2 ? (word.length % 2 === 1 ? VERB_BASE_LEN : WORD_BASE_LEN) : (word.length == 2 ? PRONOUN_BASE_LEN : UNKNOWN_BASE_LEN),
            prefixes: [], // prefixes
            suffixes: []  // suffixes
        };

        if (ret.base.length > ret.type) {
            _fe(this.prefixes, function(group) 
            {
                if (group.filter_len !== ret.type) return;
                
                for(let found_one = true; found_one;) {
                    found_one = false;
                    _fe(group.cases, function(each) 
                    {
                        const keys = Object.keys(each);

                        _fe(keys, function(one) 
                        {
                            if (ret.base.startsWith(one)) {
                                ret.prefixes[ret.prefixes.length] = each[one]; // like pa: { LANG: .... }
                                ret.base = ret.base.substring(one.length);
                                return false;
                            }
                        });
                    });
                }
            });

            _fe(this.suffixes, function(group) 
            {
                if (group.filter_len !== ret.type) return;
                
                for(let found_one = true; found_one;) {
                    found_one = false;

                    _fe(group.cases, function(each) 
                    {
                        const keys = Object.keys(each);

                        _fe(keys, function(one) 
                        {
                            if (ret.base.endsWith(one)) {
                                ret.suffixes[ret.suffixes.length] = each[one]; // like pa: { LANG: .... }
                                ret.base = ret.base.substring(0, ret.base.length - one.length);
                                found_one = true;
                                return false;
                            }
                        });
                    });
                }
            });
        }
        ret.success = ret.base.length === ret.type;

        return ret;
    }
};


/*
Structure of words:
WORD: {
    message: { // ok
        LANGUAGE: [
            "MEANINGS_IN_THIS_LANGUAGE",
            ...
        ],
        ...
    },
    examples: [ // MAY HAVE 0 OR MORE // ok
        {
            phrase: "EXAMPLE OF USAGE 1",
            message: {
                LANGUAGE: [
                    "TRANSLATED IN THIS LANGUAGE",
                    ...
                ],
                ...
            }
        }
    ],
    variants: { // MAY BE NULL IF EMPTY  // ok
        "WORD_COMBO_LIKE_ABC123": {
            message: {
                LANGUAGE: [
                    "MEANINGS_IN_THIS_LANGUAGE",
                    ...
                ],
                ...
            }
        },
        ...
    },
    // IF PARTIALLY OBSOLETE OR OBSOLETE, THESE FIELDS ARE PRESENT, but "obsolete: true" is not
    old_message: {  // ok
        LANGUAGE: [
            "MEANINGS_IN_THIS_LANGUAGE",
            ...
        ],
        ...
    },
    old_variants: { // MAY BE NULL IF EMPTY  // ok
        "WORD_COMBO_LIKE_ABC123": {
            message: {
                LANGUAGE: [
                    "MEANINGS_IN_THIS_LANGUAGE",
                    ...
                ],
                ...
            }
        },
        ...
    }
    // IF OBSOLETE, THESE FIELDS ARE PRESENT
    obsolete: true,
    replacements: [  // ok
        "KEYS TO CONSIDER",
        ...
    ]
}
*/

let __tst = null;

const dict = {

    // populate data objects with functions
    _populate: function() {  
        let fancy_id_counter = 0; // to make unique ids "unique-er"
        Object.keys(this.data).forEach(k => {
            const self = dict.data[k];

            // Make itself a HTML object
            self["toHTML"] = function(title_search_append) {
                function create_list_of_array(arr, classes_base, id, show) {
                    if (!arr || arr.length <= 0) return null;
                    if (arr.length === 1 && arr[0].val == null) return null;
                    
                    const div = document.createElement("div");

                    div.classList.add("lsw-dict-list-messages");
                    if (classes_base) div.classList.add(...classes_base);
                    if (id) div.setAttribute("id", id);

                    if (show === false) div.classList.add("lsw-hide");
                    
                    arr.forEach(e => {
                        if (e.key) {
                            const sub_title = document.createElement("h3");

                            sub_title.className = "lsw-bold lsw-inline lsw-dict-subtitle lsw-arrowed2";
                            sub_title.innerText = `${e.key}:`;

                            div.appendChild(sub_title);
                        }

                        e.val?.forEach((each, idx) => {
                            const p = document.createElement("p");
                            const span = document.createElement("span");
    
                            p.innerText = each;
                            p.classList.add("lsw-low_indent");
    
                            span.innerText = `${idx + 1}. `;
                            span.classList.add("lsw-bold");
    
                            p.prepend(span);
                            div.appendChild(p);
                        });
                    });                    

                    return div;
                }
                function create_button_enabler(resume, text, target_id_to_toggle_with, disabled, selected) {
                    const el = document.createElement("button");
                    
                    el.classList.add("lsw-btn_default");
                    el.classList.add("bar_selector");
                    el.classList.add("lsw-dict-nogrow");

                    if (disabled === true) el.classList.add("disabled");
                    if (selected === true) el.classList.add("selected");

                    el.setAttribute("text-delayed", text);
                    el.setAttribute("text", resume);
                    el.setAttribute("resumed-text", resume);
                    el.setAttribute("id-target", target_id_to_toggle_with);

                    function delayed_functionality(timeout_time) {
                        // cancel current timeout
                        const ev_id = el.getAttribute("ev-id");
                        if (ev_id) clearTimeout(ev_id);
                        el.removeAttribute("ev-id");

                        el.setAttribute("ev-id", setTimeout(function() {
                            const state = el.getAttribute("ev-state");

                            switch(state) {
                            case "enter":
                                el.setAttribute("text", el.getAttribute("text-delayed"));
                                break;
                            case "exit":
                                el.setAttribute("text", el.getAttribute("resumed-text"));
                                break;
                            }
                            el.removeAttribute("ev-state");
                        }, timeout_time));
                    }

                    el.addEventListener("mouseenter", function() {
                        const state = el.getAttribute("ev-state");

                        switch(state) {
                        case "enter":
                        case "exit":
                            el.setAttribute("ev-state", "enter");
                            break;
                        default:
                            el.setAttribute("ev-state", "enter");
                            delayed_functionality(1000);
                        }

                    });
                    el.addEventListener("mouseout", function() {
                        const state = el.getAttribute("ev-state");

                        switch(state) {
                        case "enter":
                        case "exit":
                            el.setAttribute("ev-state", "exit");
                            break;
                        default:
                            el.setAttribute("ev-state", "exit");
                            delayed_functionality(2000);
                        }
                    });

                    el.addEventListener("click", function(ev) {
                        const src = ev.target;

                        if (src.classList.contains("disabled")) return;

                        el.removeAttribute("ev-state");
                        delayed_functionality(10);

                        const target_id = src.getAttribute("id-target");
                        const target_el = document.getElementById(target_id);
                        if (!target_el) {
                            console.log(`Fatal error: element not found: ${target_id}`);
                            return;
                        }

                        const other_buttons = src.parentElement.children;
                        for (let i = 0; i < other_buttons.length; ++i) {
                            other_buttons[i].classList.remove("selected");
                        }
                        const other_transl = target_el.parentElement.children;
                        for (let i = 0; i < other_transl.length; ++i) {
                            other_transl[i].classList.add("lsw-hide");
                        }
                        target_el.classList.remove("lsw-hide");

                        src.classList.add("selected");

                        __tst = src;
                    });
                    
                    //el.innerText = "...";
                    return el;
                }

                const not_obsolete = (self.message?.[lang_sel]?.length > 0 && !self.obsolete);

                const base = document.createElement("div");                

                // key: if different, defined
                // val: meanings of key

                const message_id        = `G-${k}-msg-${fancy_id_counter++}`;
                const example_id        = `G-${k}-ex-${fancy_id_counter++}`;
                const old_message_id    = `G-${k}-omsg-${fancy_id_counter++}`;
                const variants_id       = `G-${k}-var-${fancy_id_counter++}`;
                const old_variants_id   = `G-${k}-ovar-${fancy_id_counter++}`;
                const replacements_id   = `G-${k}-repl-${fancy_id_counter++}`;

                
                const message = create_list_of_array(
                    [{key: null, val: self.message?.[lang_sel]}],
                    null,
                    message_id,
                    not_obsolete
                );
                const examples = create_list_of_array(
                    self.examples?.flatMap(function(vr){return {key: vr.phrase, val: vr.message?.[lang_sel]}; }),
                    null,
                    example_id,
                    false
                );
                const old_message = create_list_of_array(
                    [{key: null, val: self.old_message?.[lang_sel]}],
                    ["lsw-dict-obsolete"],
                    old_message_id,
                    false
                );
                const variants = create_list_of_array(
                    Object.keys(self.variants || {}).flatMap(function(vr){ return {key: vr, val: self.variants[vr].message?.[lang_sel]};}),
                    null,
                    variants_id,
                    false
                );
                const old_variants = create_list_of_array(
                    Object.keys(self.old_variants || {}).flatMap(function(vr){ return {key: vr, val: self.old_variants[vr].message?.[lang_sel]};}),
                    ["lsw-dict-obsolete"],
                    old_variants_id,
                    false
                );
                const replacements = create_list_of_array(
                    [{key: null, val: self.replacements}],
                    ["lsw-dict-replacement"],
                    replacements_id,
                    !not_obsolete
                );

                // === TITLE === //
                const title_div = document.createElement("div");
                const title_head = document.createElement("h2");

                title_head.innerText = title_search_append && title_search_append !== k ? `${k} - encontrado como '${title_search_append}':` : `${k}:`;
                title_head.classList.add("lsw-bold");
                title_head.classList.add("lsw-title");
                title_head.classList.add("lsw-inline");
                title_head.classList.add("lsw-arrowed");
                if (self.obsolete === true) {
                    title_head.classList.add("lsw-dict-obsolete");
                    title_head.setAttribute("title", "Obsoleto. Verifique por alternativas.");
                }

                title_div.classList.add("lsw-inline");
                title_div.appendChild(title_head);

                // === SELECTOR === //
                const div_selector = document.createElement("div");
                div_selector.style.gap = "0.1em";
                div_selector.classList.add("lsw-autoflex-up8");

                div_selector.appendChild(create_button_enabler("📗", "Traduções",            message_id,      message == null,          not_obsolete));
                div_selector.appendChild(create_button_enabler("📖", "Exemplos",             example_id,      examples == null,         false));
                div_selector.appendChild(create_button_enabler("📕", "Traduções obsoletas",  old_message_id,  old_message == null,      false));
                div_selector.appendChild(create_button_enabler("🌟", "Variações",            variants_id,     self.variants == null,    false));
                div_selector.appendChild(create_button_enabler("⭐", "Variações obsoletas",  old_variants_id, self.old_variants == null,false));
                div_selector.appendChild(create_button_enabler("🔄", "Substituído por",      replacements_id, replacements == null,     !not_obsolete));
                
                // === MEANINGS === //
                const desc_div = document.createElement("div");

                if (message)                    desc_div.appendChild(message);
                if (examples)                   desc_div.appendChild(examples);
                if (old_message)                desc_div.appendChild(old_message);
                if (self.variants != null)      desc_div.appendChild(variants);
                if (self.old_variants != null)  desc_div.appendChild(old_variants);
                if (replacements)               desc_div.appendChild(replacements);

                base.appendChild(title_div);
                base.appendChild(div_selector);
                base.appendChild(desc_div);

                return base;
            };

            // self check if it is built correctly. Returns string if error, null if nothing wrong
            self["_checkFormat"] = function() {
                const has_message = self["message"] != null;
                const has_old_message = self["old_message"] != null;
                const has_variants = self["variants"] != null;
                const has_old_variants = self["old_variants"] != null;
                const has_examples = self["examples"] != null;
                const has_replacements = self["replacements"] != null;
                const is_obsolete = this.obsolete || false;

                // First, root tests

                if ((has_old_variants && !has_old_message) || (has_variants && !has_message)) {
                    return "Has variants (old or not) without pair with message (old or not)";
                }
                if ((!has_old_message && !has_old_variants) && is_obsolete) {
                    return "Obsolete word without old_message or old_variants";
                }
                if ((has_message || has_variants) && is_obsolete) {
                    return "Obsolete word with message or variants as non obsolete";
                }
                if (!has_message && !is_obsolete) {
                    return "Word without message";
                }
                if (has_old_message && !has_replacements) {
                    return "Old message without replacements";
                }

                // Specific translations tests

                function test_object_keys_have_lang_and_array(obj) {
                    for (language in obj) {
                        if (!Array.isArray(obj[language])) return `Array not found in language key [${language}]`;
                    }
                    return null;
                }

                if (has_message) {
                    const err = test_object_keys_have_lang_and_array(self.message);
                    if (err) return err;
                }
                if (has_old_message) {
                    const err = test_object_keys_have_lang_and_array(self.old_message);
                    if (err) return err;
                }
                if (has_variants) {
                    const err_arr = Object.values(self.variants).flatMap(each => test_object_keys_have_lang_and_array(each.message));
                    if (err_arr.some(e => e !== null)) return err_arr[0];
                }
                if (has_old_variants) {
                    const err_arr = Object.values(self.old_variants).flatMap(each => test_object_keys_have_lang_and_array(each.message));
                    if (err_arr.some(e => e !== null)) return err_arr[0];
                }
                if (has_examples) {
                    let had_faulty_key = false;
                    let had_faulty_message = false;
                    let had_faulty_message_examples = false;

                    self.examples.forEach(each => {
                        if (!each.phrase || !each.message || Object.keys(each.message).length === 0) {
                            had_faulty_key = true;
                        }
                        for (language in each.message) {
                            if (!Array.isArray(each.message[language])) {
                                had_faulty_message = true;
                            }
                            else {
                                each.message[language].forEach(msg => {
                                    if (typeof msg !== "string") {
                                        had_faulty_message_examples = true;
                                    }
                                });
                            }
                        }
                    });

                    if (had_faulty_key) return "Faulty key in examples (phrase or message)";
                    if (had_faulty_message) return "Faulty array of messages in examples messages (not array / invalid)";
                    if (had_faulty_message_examples) return "Faulty message case in examples messages (not string)";
                }

                return null;
            };
        });

        // check, for debug
        let errors = 0;
        Object.keys(dict.data).forEach(e => {
            obj = dict.data[e]; 
            const res = obj._checkFormat();
            if (res) {
              console.log(`[WARN][DICT][SELF-TEST] ${e} has error of type ${typeof res}:`);
              console.log(res);
              ++errors;
            }
        });
        if (errors > 0) console.log(`[WARN][DICT][SELF-TEST] Attention! There may be some words malformated! This may break the application! Total of issues: ${errors}`);
        else            console.log(`[INFO][DICT][SELF-TEST] Passed self test of word checking successfully.`);
    },

    // This uses lang_sel to dig in a single language (for now, BR)
    // Fun fact 2: this will not consider old_message (partially or totally obsolete)
    DeepSearchCollisions: function() {
        const brValues = {};
        const groups = [];

        for (const key in this.data) {
            const obj = this.data[key];
            const brArray = obj.message?.[lang_sel] || [];
            const variantBrArrays = Object.values(obj.variants || {}).flatMap(variant => variant.message?.[lang_sel] || []);

            const allBrValues = [...brArray, ...variantBrArrays];

            allBrValues.forEach(value => {
                if (!brValues[value]) {
                    brValues[value] = [];
                }
                brValues[value].push(key);
            });
        }

        const seen = new Set();
        for (const value in brValues) {
            const keys = brValues[value];
            if (keys.length > 1) {
                const group = keys.filter(key => !seen.has(key));
                if (group.length > 1) {
                    groups.push({ keys: group, match: value });
                    group.forEach(key => seen.add(key));
                }
            }
        }

        console.log(`Found ${groups.length} collision(s).`);
        for(let i = 0; i < groups.length; ++i) {
            console.log(`Collision ${i + 1}: [${groups[i].keys.join(", ")}] => ${groups[i].match}`);
        }
    },

    // Expects old format, used only to easily convert one version to the other one (__dict)
    _StaticConvertOldToNew: function(oo) {
        const dat = {};

        function __expand_examples_array(ex_old) {
            if (!ex_old) return [];

            let ex = [];
            for (let i = 0; i < ex_old.length; ++i) {
                ex[ex.length] = {
                    phrase: ex_old[i][0],
                    message: {
                        br: ex_old[i][1]
                    }                    
                }
            }
            return ex;
        }

        for (let i = 0; i < oo.length; ++i) {
             // contains:
             // - l (larinuim version)
             // - d (array of meanings in br)
             // - e (examples, array of array (pair) with ex and transl)
             // - discontinued (true if not used anymore)
            const word = oo[i];

            if (dat[word.l] !== undefined) {
                console.log(`FATAL ERROR: DOUBLE KEY: ${word.l} key on object found twice! Aborting...`);
                return {};
            }

            dat[word.l] = {
                message: {
                    br: [...word.d]
                },
                examples: __expand_examples_array(word.e),
                variants: null
            }
        }

        return dat;
    },

    /*
    Returns object like (note: perfect matches can only be non obsolete or non old_*)
    {
        perfect_matches: [
            {
                key: "MATCHED KEY",
                old_or_replacement: true/false,
                src: {...} // dict.data object
            },
            ...
        ]
        other_cases: [
            {
                key: "MATCHED KEY",
                old_or_replacement: true/false,
                src: {...} // dict.data object
            },
            ...
        ]
    }
    */
    _SearchLarinuim: function(word) {
        const res = {
            perfect_matches: [],
            other_cases: [],
            deconstructed_word: affixes.DeconstructWord(word)
        };


        const base_names = Object.keys(this.data).map(function(k){ return {key: k, src: {[k]: dict.data[k]}, old_or_replacement: false} });
        const variants = [];
        const old_variants = [];
        const replacements = [];

        Object.keys(this.data).forEach(k => {
            const o = dict.data[k];
            if (o["variants"]) {
                const tmp = Object.keys(o.variants).map(function(k){ return {key: k, src: {[k]: o}, old_or_replacement: false} });
                variants.push(...tmp);
            }
            if (o["old_variants"]) {
                const tmp = Object.keys(o.old_variants).map(function(k){ return {key: k, src: {[k]: o}, old_or_replacement: true }})
                old_variants.push(...tmp);
            }
            if (o["replacements"]) {
                const tmp = Object.keys(o.replacements).map(function(k){ return {key: k, src: {[k]: o}, old_or_replacement: true} })
                replacements.push(...tmp);
            }
        });

        const found_base = base_names.filter(each => each.key.indexOf(res.deconstructed_word.base) !== -1);
        const found_variants = variants.filter(each => each.key.indexOf(res.deconstructed_word.base) !== -1);
        const found_old_variants = old_variants.filter(each => each.key.indexOf(res.deconstructed_word.base) !== -1);
        const found_replacements = replacements.filter(each => each.key.indexOf(res.deconstructed_word.base) !== -1);

        const found = [...new Map([...found_base, ...found_variants, ...found_old_variants, ...found_replacements].map(item => [item.key, item])).values()];

        if (found.length === 0) return res;

        res.perfect_matches = found.filter(each => !each.old_or_replacement && each.key === word);
        res.other_cases = found.filter(each => each.old_or_replacement || each.key !== word);
        
        return res;
    },

    /*
    Returns object like (note: perfect matches can only be non obsolete or non old_*)
    {
        perfect_matches: [
            {
                key: "MATCHED STRING TRANSLATION",
                old_or_replacement: true/false,
                src: {...} // dict.data object
            },
            ...
        ]
        other_cases: [
            {
                key: "MATCHED STRING TRANSLATION",
                old_or_replacement: true/false,
                src: {...} // dict.data object
            },
            ...
        ]
    }
    */
    _SearchTranslated: function(message) {
        const res = {
            perfect_matches: [],
            other_cases: []
        };

        const found_raw = [];

        Object.keys(this.data).forEach(k => {
            const self = dict.data[k];

            const self_messages = self.message?.[lang_sel]?.filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: false }; }) || [];
            const self_old_messages = self.old_message?.[lang_sel].filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: true }; }) || [];

            const examples_phrases_match = self.examples?.filter(ex => ex.phrase.indexOf(message) !== -1).flatMap(function(ex){ return {key: ex.phrase, src: {[k]: self}, old_or_replacement: false }; }) || [];
            const any_variant_match = Object.values(self.variants ?? {}).flatMap(e => e.message?.[lang_sel]).filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: false }; }) || [];

            const old_examples_phrases_match = self.old_examples?.filter(ex => ex.phrase.indexOf(message) !== -1).flatMap(function(ex){ return {key: ex.phrase, src: {[k]: self}, old_or_replacement: true }; }) || [];
            const old_any_variant_match = Object.values(self.old_variants ?? {}).flatMap(e => e.message?.[lang_sel]).filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: true }; }) || [];

            if (self_messages.length) found_raw.push(...self_messages);
            if (self_old_messages.length) found_raw.push(...self_old_messages);
            if (examples_phrases_match.length) found_raw.push(...examples_phrases_match);
            if (any_variant_match.length) found_raw.push(...any_variant_match);
            if (old_examples_phrases_match.length) found_raw.push(...old_examples_phrases_match);
            if (old_any_variant_match.length) found_raw.push(...old_any_variant_match);
        });

        const found = [...new Map([...found_raw].map(item => [item.key, item])).values()];

        res.perfect_matches = found.filter(each => !each.old_or_replacement && each.key === message);
        res.other_cases = found.filter(each => each.old_or_replacement || each.key !== message);

        return res;
    },

    // Combines Larinuim and Translated results in one
    Search: function(word) {
        if (!word || word == null) {
            return {
                perfect_matches: [],
                other_cases: Object.keys(dict.data).flatMap(function(k){ return {key: k, src: {[k]: dict.data[k]}, old_or_replacement: dict.data[k].obsolete ? true : false}})
            };
        }

        word = word.toLowerCase().trim();

        const larinuim = this._SearchLarinuim(word);
        const translated = this._SearchTranslated(word);

        console.log(larinuim);
        console.log(translated);

        const perfect_matches = [...new Map([...larinuim.perfect_matches, ...translated.perfect_matches].map(item => [item.key, item])).values()];
        const other_cases = [...new Map([...larinuim.other_cases, ...translated.other_cases].map(item => [item.key, item])).values()];


        return {
            perfect_matches: perfect_matches,
            other_cases: other_cases,
            deconstructed_word: larinuim.deconstructed_word
        };
    },

    GetLength: function() {
        return Object.keys(this.data).length;
    },

    GetIndex: function(idx) {
        const keys = Object.keys(this.data);
        if (idx < 0 || idx >= keys.length) return null;
        return this.data[keys[idx]];
    },
    

    data: {
        ae: {
            message: {
                br: [
                    "você",
                    "ele"
                ]
            },
            examples: [
                {
                    phrase: "ae tue gatx",
                    message: {
                        br: [
                            "você é bonito"
                        ]
                    }
                },
                {
                    phrase: "ae pod jap",
                    message: {
                        br: [
                            "ele pode voar"
                        ]
                    }
                }
            ],
            variants: null
        },
        ai: {
            message: {
                br: [
                    "isso",
                    "isto"
                ]
            },
            examples: [
                {
                    phrase: "ai tue topt",
                    message: {
                        br: [
                            "isso é divertido"
                        ]
                    }
                },
                {
                    phrase: "maol ai tuepa wafku",
                    message: {
                        br: [
                            "então isso foi concluído"
                        ]
                    }
                }
            ],
            variants: null
        },
        as: {
            message: {
                br: [
                    "nosso",
                    "nossa"
                ]
            },
            examples: [
                {
                    phrase: "olal edof tue as",
                    message: {
                        br: [
                            "o dinheiro é nosso (do grupo da pessoa falando)"
                        ]
                    }
                }
            ],
            variants: null
        },
        au: {
            message: {
                br: [
                    "nosso",
                    "nossa"
                ]
            },
            examples: [
                {
                    phrase: "au brad lolk tohd etit",
                    message: {
                        br: [
                            "nosso pão de cada dia (todos aplicáveis)"
                        ]
                    }
                }
            ],
            variants: null
        },
        av: {
            message: {
                br: [
                    "seu",
                    "sua",
                    "seus",
                    "suas"
                ]
            },
            examples: null,
            variants: null
        },
        ea: {
            message: {
                br: [
                    "seu",
                    "sua"
                ]
            },
            examples: null,
            variants: null
        },
        eu: {
            message: {
                br: [
                    "meu",
                    "minha"
                ]
            },
            examples: null,
            variants: null
        },
        sa: {
            message: {
                br: [
                    "nós"
                ]
            },
            examples: null,
            variants: null
        },
        ua: {
            message: {
                br: [
                    "nós"
                ]
            },
            examples: null,
            variants: null
        },
        ue: {
            message: {
                br: [
                    "eu"
                ]
            },
            examples: null,
            variants: null
        },
        va: {
            message: {
                br: [
                    "eles",
                    "vocês"
                ]
            },
            examples: null,
            variants: null
        },
        wa: {
            message: {
                br: [
                    "aquilo"
                ]
            },
            examples: null,
            variants: null
        },
        abd: {
            message: {
                br: [
                    "aprender",
                    "conhecer",
                    "experienciar",
                    "experimentar",
                    "exercitar",
                    "treinar",
                    "absorver",
                    "estudar",
                    "testar",
                    "provar"
                ]
            },
            examples: null,
            variants: {
                abdku: {
                    message: {
                        br: [
                            "aprendizado",
                            "conhecimento",
                            "conhecido",
                            "experiência",
                            "experimento",
                            "exercício",
                            "treinamento",
                            "treino",
                            "absorção",
                            "estudo",
                            "teste",
                            "testador",
                            "prova"
                        ]
                    }
                }
            }
        },
        abl: {
            message: {
                br: [
                    "acontecer",
                    "preparar",
                    "gerar",
                    "produzir",
                    "ajustar",
                    "prontificar",
                    "existir"
                ]
            },
            examples: null,
            variants: null
        },
        adi: {
            message: {
                br: [
                    "conhecer",
                    "descobrir",
                    "inventar",
                    "desabrochar"
                ]
            },
            examples: null,
            variants: null
        },
        aka: {
            message: {
                br: [
                    "arrumar",
                    "organizar",
                    "otimizar",
                    "conseguir"
                ]
            },
            examples: null,
            variants: null
        },
        ale: {
            message: {
                br: [
                    "escovar",
                    "pentear",
                    "acariciar",
                    "tocar",
                    "aconchegar",
                    "abraçar",
                    "desculpar"
                ]
            },
            examples: null,
            variants: null
        },
        alg: {
            message: {
                br: [
                    "almoçar",
                    "alimentar",
                    "lanchar",
                    "entupir",
                    "pintar",
                    "pincelar",
                    "comer",
                    "preencher",
                    "merendar"
                ]
            },
            examples: null,
            variants: {
                algku: {
                    message: {
                        br: [
                            "almoço",
                            "alimento",
                            "lanche",
                            "entupimento",
                            "pintura",
                            "pincelada",
                            "comida",
                            "preenchimento",
                            "refeição",
                            "piquenique",
                            "merenda"
                        ]
                    }
                }
            }
        },
        awf: {
            message: {
                br: [
                    "recuperar",
                    "consertar",
                    "corrigir",
                    "desfazer",
                    "cancelar",
                    "atrasar",
                    "tardar",
                    "retornar",
                    "devolver"
                ]
            },
            examples: null,
            variants: {
                awfku: {
                    message: {
                        br: [
                            "recuperação",
                            "conserto",
                            "correção",
                            "desfazimento",
                            "cancelamento",
                            "atraso",
                            "tardança",
                            "tarde",
                            "retorno",
                            "devolução",
                            "rescisão"
                        ]
                    }
                }
            }
        },
        bak: {
            message: {
                br: [
                    "pegar",
                    "capturar",
                    "agarrar",
                    "segurar",
                    "obter",
                    "receber",
                    "aceitar",
                    "ver"
                ]
            },
            examples: null,
            variants: null
        },
        bal: {
            message: {
                br: [
                    "carregar",
                    "transportar",
                    "recarregar",
                    "obter",
                    "receber",
                    "informar",
                    "ler"
                ]
            },
            examples: null,
            variants: null
        },
        bih: {
            message: {
                br: [
                    "chorar",
                    "lacrimejar",
                    "entristecer",
                    "piorar",
                    "maleficar",
                    "estragar",
                    "envelhecer",
                    "finalizar",
                    "terminar"
                ]
            },
            examples: null,
            variants: null
        },
        bla: {
            message: {
                br: [
                    "conversar",
                    "falar",
                    "papear",
                    "discutir",
                    "determinar",
                    "delatar",
                    "acusar",
                    "denunciar",
                    "entregar"
                ]
            },
            examples: null,
            variants: null
        },
        bly: {
            message: {
                br: [
                    "vender",
                    "comercializar",
                    "mercadejar",
                    "mercantilizar",
                    "negociar",
                    "transacionar",
                    "delatar",
                    "acusar",
                    "denunciar",
                    "entregar",
                    "malsinar",
                    "sacrificar",
                    "trair"
                ]
            },
            examples: null,
            variants: null
        },
        bty: {
            message: {
                br: [
                    "comprar",
                    "mercar",
                    "adquirir",
                    "obter"
                ]
            },
            examples: null,
            variants: null
        },
        buy: {
            message: {
                br: [
                    "cobrir",
                    "sobrepor",
                    "tampar"
                ]
            },
            examples: null,
            variants: null
        },
        byh: {
            message: {
                br: [
                    "chover",
                    "molhar",
                    "lavar",
                    "limpar",
                    "banhar",
                    "lavar",
                    "limpar"
                ]
            },
            examples: null,
            variants: null
        },
        cla: {
            message: {
                br: [
                    "apertar",
                    "clicar",
                    "pressionar",
                    "empurrar",
                    "cutucar",
                    "mover",
                    "deslocar",
                    "acelerar",
                    "promover",
                    "elencar",
                    "eleger",
                    "anunciar"
                ]
            },
            examples: null,
            variants: null
        },
        cra: {
            message: {
                br: [
                    "comer",
                    "alimentar",
                    "ingerir",
                    "consumir",
                    "sobreviver",
                    "procriar",
                    "acasalar",
                    "trepar"
                ]
            },
            examples: null,
            variants: null
        },
        cro: {
            message: {
                br: [
                    "acreditar",
                    "imaginar",
                    "devanear",
                    "sonhar",
                    "borboletear",
                    "esboçar",
                    "fabricar",
                    "forjar",
                    "formar",
                    "seguir",
                    "crer",
                    "acatar",
                    "aderir",
                    "adotar",
                    "aprovar",
                    "assentir",
                    "consentir",
                    "reconhecer"
                ]
            },
            examples: null,
            variants: null
        },
        cto: {
            message: {
                br: [
                    "curtir",
                    "divertir",
                    "alegrar",
                    "aprazer",
                    "contentar",
                    "deliciar",
                    "entreter",
                    "recrear",
                    "satisfazer",
                    "agradar"
                ]
            },
            examples: null,
            variants: null
        },
        dak: {
            message: {
                br: [
                    "morar",
                    "residir",
                    "habitar",
                    "domiciliar",
                    "viver",
                    "existir",
                    "haver",
                    "perdurar",
                    "resistir",
                    "descender",
                    "proceder",
                    "depender",
                    "viciar"
                ]
            },
            examples: null,
            variants: null
        },
        dap: {
            message: {
                br: [
                    "beber",
                    "tomar",
                    "consumir",
                    "engolir",
                    "liquidar",
                    "levar",
                    "receber",
                    "sugar",
                    "responder",
                    "responsabilizar",
                    "justificar",
                    "explicar",
                    "analisar"
                ]
            },
            examples: null,
            variants: null
        },
        dec: {
            message: {
                br: [
                    "achar",
                    "avistar",
                    "descobrir",
                    "encontrar",
                    "varrer",
                    "pesquisar",
                    "raciocinar",
                    "procurar",
                    "manifestar",
                    "aclarar",
                    "destramar",
                    "revelar",
                    "explicar",
                    "deparar",
                    "demarcar",
                    "registrar",
                    "pensar",
                    "traçar"
                ]
            },
            examples: null,
            variants: {
                decku: {
                    message: {
                        br: [
                            "achado",
                            "avistamento",
                            "descoberta",
                            "encontro",
                            "encontrável",
                            "varredura",
                            "pesquisa",
                            "raciocínio",
                            "procura",
                            "procurador",
                            "manifestação",
                            "aclaramento",
                            "destramação",
                            "revelação",
                            "explicação",
                            "deparação",
                            "demarcação",
                            "registro",
                            "pensamento",
                            "traçado",
                            "traço"
                        ]
                    }
                }
            }
        },
        dee: {
            message: {
                br: [
                    "feder",
                    "estragar",
                    "poluir",
                    "desfigurar",
                    "deformar",
                    "descaracterizar",
                    "falsificar",
                    "degradar",
                    "adulterar",
                    "falsear",
                    "depreciar",
                    "acanalhar",
                    "falsar"
                ]
            },
            examples: null,
            variants: null
        },
        def: {
            message: {
                br: [
                    "criar",
                    "inovar",
                    "transformar",
                    "converter",
                    "cuidar",
                    "atentar",
                    "zelar"
                ]
            },
            examples: null,
            variants: null
        },
        dek: {
            message: {
                br: [
                    "ensinar",
                    "mostrar",
                    "expor",
                    "apresentar",
                    "apontar",
                    "descobrir",
                    "descamuflar",
                    "aparecer",
                    "reaparecer",
                    "despir",
                    "desproteger"
                ]
            },
            examples: null,
            variants: {
                dekku: {
                    message: {
                        br: [
                            "ensino",
                            "mostramento",
                            "mostra",
                            "exposição",
                            "exposto",
                            "apresentação",
                            "apontamento",
                            "descoberta",
                            "descamuflagem",
                            "aparição",
                            "reaparição",
                            "despiração",
                            "desproteção"
                        ]
                    }
                }
            }
        },
        des: {
            message: {
                br: [
                    "humilhar",
                    "se fazer acima de algo ou alguém",
                    "insinuar que algo ou alguém é superior a outra coisa",
                    "degradar",
                    "rebaixar",
                    "macular",
                    "desonrar",
                    "diminuir",
                    "infamar"
                ]
            },
            examples: null,
            variants: null
        },
        dla: {
            message: {
                br: [
                    "montar",
                    "juntar",
                    "combinar",
                    "construir",
                    "fundir",
                    "gerar",
                    "formar",
                    "transformar",
                    "subir",
                    "somar",
                    "adotar",
                    "acolher",
                    "aprovar",
                    "aderir"
                ]
            },
            examples: null,
            variants: null
        },
        dos: {
            message: {
                br: [
                    "processar",
                    "fazer algo com algo",
                    "trabalhar (com coisas para resultar em algo)",
                    "tratar",
                    "negociar",
                    "processar",
                    "defender",
                    "cuidar",
                    "zelar",
                    "vigiar",
                    "cautelar",
                    "acautelar",
                    "precaver"
                ]
            },
            examples: null,
            variants: null
        },
        duh: {
            message: {
                br: [
                    "funcionar",
                    "encaixar",
                    "caber",
                    "costumar",
                    "acostumar",
                    "afazer",
                    "afeiçoar",
                    "habituar",
                    "praticar",
                    "treinar"
                ]
            },
            examples: null,
            variants: null
        },
        dwa: {
            message: {
                br: [
                    "detonar",
                    "explodir",
                    "foder",
                    "transar",
                    "estourar",
                    "penetrar",
                    "romper",
                    "jorrar",
                    "estalar",
                    "estralar",
                    "soar",
                    "zoar"
                ]
            },
            examples: null,
            variants: null
        },
        dyd: {
            message: {
                br: [
                    "duvidar",
                    "perguntar",
                    "questionar",
                    "hesitar",
                    "oscilar",
                    "indagar",
                    "interrogar",
                    "sindicar"
                ]
            },
            old_message: {
                br: [
                    "flutuar"
                ]
            },
            examples: [
                {
                    phrase: "wu espa eu dyd lolk ae?",
                    message: {
                        br: [
                            "Por que eu duvido de você?"
                        ]
                    }
                }
            ],
            variants: {
                dydku: {
                    message: {
                        br: [
                            "dúvida",
                            "pergunta",
                            "questionamento",
                            "hesitação",
                            "flutuação",
                            "oscilação",
                            "indagação",
                            "interrogação",
                            "sindicância",
                            "sindicato"
                        ]
                    }
                }
            },
            old_variants: {
                dydku: {
                    message: {
                        br: [
                            "flutuação"
                        ]
                    }
                }
            },
            replacements: [
                "japku"
            ]
        },
        ena: {
            message: {
                br: [
                    "usar",
                    "aplicar",
                    "executar",
                    "empregar",
                    "recorrer",
                    "aproveitar",
                    "servir",
                    "explorar"
                ]
            },
            examples: null,
            variants: null
        },
        ene: {
            message: {
                br: [
                    "lembrar",
                    "anotar",
                    "escrever",
                    "decorar",
                    "fotografar",
                    "registrar",
                    "revelar",
                    "imprimir",
                    "colar",
                    "clonar",
                    "memorar",
                    "memorizar",
                    "recordar",
                    "relembrar",
                    "repassar"
                ]
            },
            examples: null,
            variants: {
                eneku: {
                    message: {
                        br: [
                            "lembrança",
                            "anotação",
                            "escrita",
                            "decoração",
                            "fotografia",
                            "registro",
                            "revelação",
                            "impressão",
                            "colagem",
                            "clonagem",
                            "memorização",
                            "memória",
                            "recordação",
                            "relembrança",
                            "repassagem"
                        ]
                    }
                }
            }
        },
        eni: {
            message: {
                br: [
                    "bater",
                    "revidar",
                    "golpear"
                ]
            },
            examples: null,
            variants: {
                eniku: {
                    message: {
                        br: [
                            "batida",
                            "revidação",
                            "golpe"
                        ]
                    }
                }
            }
        },
        eny: {
            message: {
                br: [
                    "energizar",
                    "ligar",
                    "levantar",
                    "subir",
                    "empoderar",
                    "conectar",
                    "plugar",
                    "inserir",
                    "alimentar",
                    "engravidar"
                ]
            },
            examples: null,
            variants: {
                enyku: {
                    message: {
                        br: [
                            "energia",
                            "ligação",
                            "levantamento",
                            "subida",
                            "empoderamento",
                            "conexão",
                            "inserção",
                            "alimentação",
                            "engravidamento"
                        ]
                    }
                }
            },
            old_message: {
                br: [
                    "bater",
                    "revidar",
                    "golpear"
                ]
            },
            old_variants: {
                enyku: {
                    message: {
                        br: [
                            "batida",
                            "revidação",
                            "golpe"
                        ]
                    }
                }
            },
            replacements: [
                "eni"
            ]
        },
        epy: {
            message: {
                br: [
                    "desligar",
                    "desenergizar",
                    "agachar",
                    "descer",
                    "renunciar",
                    "desconectar",
                    "desplugar",
                    "remover",
                    "esfomear",
                    "abortar"
                ]
            },
            examples: null,
            variants: null
        },
        esy: {
            message: {
                br: [
                    "chupar",
                    "sugar",
                    "remover",
                    "inspirar",
                    "comprimir",
                    "compactar",
                    "esmagar",
                    "apertar",
                    "pressionar"
                ]
            },
            examples: null,
            variants: null
        },
        eti: {
            message: {
                br: [
                    "analisar",
                    "desdobrar",
                    "decifrar",
                    "combater"
                ]
            },
            examples: null,
            variants: {
                etiku: {
                    message: {
                        br: [
                            "análise",
                            "desdobramento",
                            "decifração",
                            "decifrado",
                            "combate"
                        ]
                    }
                }
            }
        },
        ety: {
            message: {
                br: [
                    "afastar",
                    "distanciar",
                    "separar",
                    "desconectar",
                    "desplugar",
                    "terminar",
                    "abortar",
                    "evitar"
                ]
            },
            old_message: {
                br: [
                    "analisar",
                    "desdobrar",
                    "decifrar",
                    "combater",
                    "relaxar",
                    "descansar"
                ]
            },
            examples: null,
            variants: {
                etyku: {
                    message: {
                        br: [
                            "afastamento",
                            "distanciamento",
                            "separação",
                            "desconexão",
                            "desplugamento",
                            "término",
                            "aborto",
                            "evitação"
                        ]
                    }
                }
            },
            old_variants: {
                etyku: {
                    message: {
                        br: [
                            "análise",
                            "desdobramento",
                            "decifração",
                            "decifrado",
                            "combate",
                            "relaxamento",
                            "descanso"
                        ]
                    }
                }
            },
            replacements: [
                "eti",
                "etw"
            ]
        },
        etw: {
            message: {
                br: [
                    "relaxar",
                    "descansar"
                ]
            },
            examples: null,
            variants: {
                etwku: {
                    message: {
                        br: [
                            "relaxamento",
                            "descanso"
                        ]
                    }
                }
            }
        },
        fab: {
            message: {
                br: [
                    "emprestar",
                    "alugar"
                ]
            },
            examples: null,
            variants: {
                fabku: {
                    message: {
                        br: [
                            "empréstimo",
                            "aluguel"
                        ]
                    }
                }
            }
        },
        faq: {
            message: {
                br: [
                    "levar",
                    "transportar",
                    "carregar",
                    "enviar",
                    "exportar",
                    "transferir",
                    "promover",
                    "movimentar"
                ]
            },
            examples: null,
            variants: {
                faqku: {
                    message: {
                        br: [
                            "leva",
                            "transporte",
                            "carregamento",
                            "envio",
                            "exportação",
                            "transferência",
                            "promoção",
                            "movimento"
                        ]
                    }
                }
            }
        },
        fla: {
            message: {
                br: [
                    "copiar",
                    "parecer",
                    "clonar",
                    "disfarçar",
                    "apresentar",
                    "vestir",
                    "arrumar",
                    "imprimir",
                    "transformar"
                ]
            },
            examples: null,
            variants: null
        },
        fle: {
            message: {
                br: [
                    "dizer",
                    "falar",
                    "impor",
                    "ditar",
                    "comandar",
                    "anunciar",
                    "postar",
                    "enviar",
                    "apresentar",
                    "motivar"
                ]
            },
            examples: null,
            variants: null
        },
        flo: {
            message: {
                br: [
                    "cair",
                    "tropeçar",
                    "afundar",
                    "mergulhar",
                    "aprofundar",
                    "entrar",
                    "soltar",
                    "desprender",
                    "desamarrar"
                ]
            },
            examples: null,
            variants: null
        },
        fti: {
            message: {
                br: [
                    "adicionar",
                    "somar",
                    "incrementar",
                    "juntar",
                    "transformar",
                    "adquirir",
                    "entrar",
                    "sincronizar"
                ]
            },
            examples: null,
            variants: null
        },
        fur: {
            message: {
                br: [
                    "conseguir",
                    "dominar",
                    "solucionar",
                    "resolver",
                    "terminar",
                    "acabar",
                    "finalizar",
                    "conquistar",
                    "capturar",
                    "prender",
                    "trancar",
                    "trancafiar",
                    "bloquear",
                    "fechar",
                    "resistir",
                    "sobreviver",
                    "garantir",
                    "sustentar"
                ]
            },
            examples: null,
            variants: {
                furku: {
                    message: {
                        br: [
                            "conquista",
                            "domínio",
                            "solução",
                            "resolução",
                            "finalização",
                            "término",
                            "fim",
                            "conquista",
                            "captura",
                            "prisão",
                            "trancamento",
                            "tranca",
                            "bloqueio",
                            "fechamento",
                            "resistência",
                            "sobrevivência",
                            "garantia",
                            "sustentação"
                        ]
                    }
                }
            }
        },
        fyl: {
            message: {
                br: [
                    "animar",
                    "alegrar",
                    "enfeitar",
                    "melhorar",
                    "embelezar",
                    "produzir",
                    "reanimar",
                    "acordar",
                    "nascer",
                    "irradiar",
                    "brilhar",
                    "crescer",
                    "revelar",
                    "desmascarar"
                ]
            },
            examples: null,
            variants: null
        },
        gaq: {
            message: {
                br: [
                    "conduzir",
                    "guiar",
                    "seguir",
                    "trilhar",
                    "inscrever",
                    "assinar",
                    "caminhar"
                ]
            },
            examples: null,
            variants: null
        },
        gds: {
            message: {
                br: [
                    "ajudar",
                    "colaborar",
                    "participar",
                    "retribuir",
                    "investir",
                    "aplicar",
                    "doar",
                    "oferecer"
                ]
            },
            examples: null,
            variants: null
        },
        gka: {
            message: {
                br: [
                    "destacar",
                    "aparecer",
                    "destacar",
                    "fixar",
                    "focar"
                ]
            },
            examples: null,
            variants: {
                gkaku: {
                    message: {
                        br: [
                            "preocupação",
                            "assustamento",
                            "destaque",
                            "destacado",
                            "aparição",
                            "fixação",
                            "foco"
                        ]
                    }
                }
            }
        },
        gku: {
            message: {
                br: [
                    "preocupar",
                    "assustar",
                ]
            },
            old_message: {
                br: [
                    "destacar",
                    "aparecer",
                    "destacar",
                    "fixar",
                    "focar",
                    "tachar"
                ]
            },
            examples: null,
            variants: {
                gkuku: {
                    message: {
                        br: [
                            "preocupação",
                            "assustamento"
                        ]
                    }
                }
            },
            old_variants: {
                gkuku: {
                    message: {
                        br: [
                            "destaque",
                            "destacado",
                            "aparição",
                            "fixação",
                            "foco",
                            "tacha"
                        ]
                    }
                }
            },
            replacements: [
                "gka",
                "uls"
            ]
        },
        gno: {
            message: {
                br: [
                    "ir",
                    "passar",
                    "expirar",
                    "perecer",
                    "acabar",
                    "terminar",
                    "finalizar"
                ]
            },
            examples: null,
            variants: null
        },
        gto: {
            message: {
                br: [
                    "gostar",
                    "apreciar"
                ]
            },
            examples: null,
            variants: null
        },
        guk: {
            message: {
                br: [
                    "subir"
                ]
            },
            examples: null,
            variants: null
        },
        hug: {
            message: {
                br: [
                    "avisar"
                ]
            },
            examples: null,
            variants: null
        },
        hyc: {
            message: {
                br: [
                    "enxergar",
                    "olhar",
                    "ver"
                ]
            },
            examples: null,
            variants: {
                hycku: {
                    message: {
                        br: [
                            "enxergável",
                            "olhável",
                            "visível",
                            "visto",
                            "vista",
                            "visão"
                        ]
                    }
                }
            }
        },
        hye: {
            message: {
                br: [
                    "verificar"
                ]
            },
            examples: null,
            variants: null
        },
        hyi: {
            message: {
                br: [
                    "esconder",
                    "desaparecer",
                    "sumir"
                ]
            },
            examples: null,
            variants: null
        },
        ihk: {
            message: {
                br: [
                    "adorar"
                ]
            },
            examples: null,
            variants: null
        },
        ike: {
            message: {
                br: [
                    "dever"
                ]
            },
            examples: null,
            variants: null
        },
        iki: {
            message: {
                br: [
                    "merecer"
                ]
            },
            examples: null,
            variants: null
        },
        ikk: {
            message: {
                br: [
                    "atrapalhar"
                ]
            },
            examples: null,
            variants: null
        },
        jap: {
            message: {
                br: [
                    "voar",
                    "flutuar",
                    "planar",
                    "sobrevoar"
                ]
            },
            examples: null,
            variants: null
        },
        jip: {
            message: {
                br: [
                    "beijar"
                ]
            },
            examples: null,
            variants: null
        },
        jki: {
            message: {
                br: [
                    "lavar"
                ]
            },
            examples: null,
            variants: null
        },
        jol: {
            message: {
                br: [
                    "bater",
                    "golpear"
                ]
            },
            examples: null,
            variants: null
        },
        kaa: {
            message: {
                br: [
                    "exigir",
                    "invocar"
                ]
            },
            examples: null,
            variants: null
        },
        kei: {
            message: {
                br: [
                    "encher",
                    "servir"
                ]
            },
            examples: null,
            variants: null
        },
        kek: {
            message: {
                br: [
                    "desapontar"
                ]
            },
            examples: null,
            variants: null
        },
        kgo: {
            message: {
                br: [
                    "libertar"
                ]
            },
            examples: null,
            variants: null
        },
        kik: {
            message: {
                br: [
                    "dormir"
                ]
            },
            examples: null,
            variants: null
        },
        kok: {
            message: {
                br: [
                    "veja"
                ]
            },
            examples: null,
            variants: null
        },
        kop: {
            message: {
                br: [
                    "colaborar",
                    "participar"
                ]
            },
            examples: null,
            variants: null
        },
        koy: {
            message: {
                br: [
                    "amassar",
                    "amocar"
                ]
            },
            examples: null,
            variants: null
        },
        krk: {
            message: {
                br: [
                    "atualizar"
                ]
            },
            examples: null,
            variants: null
        },
        kro: {
            message: {
                br: [
                    "fazer"
                ]
            },
            examples: null,
            variants: null
        },
        lak: {
            message: {
                br: [
                    "abaixar"
                ]
            },
            examples: null,
            variants: null
        },
        laq: {
            message: {
                br: [
                    "baixar",
                    "puxar",
                    "trazer"
                ]
            },
            examples: null,
            variants: null
        },
        lar: {
            message: {
                br: [
                    "trabalhar",
                    "desenvolver",
                    "manusear"
                ]
            },
            examples: null,
            variants: null
        },
        lay: {
            message: {
                br: [
                    "escutar",
                    "ouvir"
                ]
            },
            examples: null,
            variants: null
        },
        laz: {
            message: {
                br: [
                    "iluminar"
                ]
            },
            examples: null,
            variants: null
        },
        lea: {
            message: {
                br: [
                    "parar"
                ]
            },
            examples: null,
            variants: null
        },
        leh: {
            message: {
                br: [
                    "adivinhar"
                ]
            },
            examples: null,
            variants: null
        },
        lep: {
            message: {
                br: [
                    "brincar"
                ]
            },
            examples: null,
            variants: null
        },
        lii: {
            message: {
                br: [
                    "sorrir"
                ]
            },
            examples: null,
            variants: null
        },
        lio: {
            message: {
                br: [
                    "entender"
                ]
            },
            examples: null,
            variants: null
        },
        lod: {
            message: {
                br: [
                    "estudar"
                ]
            },
            examples: null,
            variants: null
        },
        lof: {
            message: {
                br: [
                    "odiar"
                ]
            },
            examples: null,
            variants: null
        },
        log: {
            message: {
                br: [
                    "chutar"
                ]
            },
            examples: null,
            variants: null
        },
        lot: {
            message: {
                br: [
                    "perder",
                    "tirar",
                    "roubar"
                ]
            },
            examples: null,
            variants: null
        },
        lra: {
            message: {
                br: [
                    "cantar"
                ]
            },
            examples: null,
            variants: null
        },
        lui: {
            message: {
                br: [
                    "existir",
                    "haver"
                ]
            },
            examples: null,
            variants: null
        },
        luk: {
            message: {
                br: [
                    "fumar",
                    "sujar",
                    "manchar"
                ]
            },
            examples: null,
            variants: {
                lukku: {
                    message: {
                        br: [
                            "fumado",
                            "sujo",
                            "sujeira",
                            "manchado"
                        ]
                    }
                }
            }
        },
        lur: {
            message: {
                br: [
                    "acertar"
                ]
            },
            examples: null,
            variants: null
        },
        lyr: {
            message: {
                br: [
                    "errar",
                    "falhar",
                    "fracassar"
                ]
            },
            examples: null,
            variants: null
        },
        mig: {
            message: {
                br: [
                    "contar",
                    "fatiar",
                    "distribuir"
                ]
            },
            examples: null,
            variants: null
        },
        nag: {
            message: {
                br: [
                    "estressar"
                ]
            },
            examples: null,
            variants: null
        },
        nak: {
            message: {
                br: [
                    "cochilar"
                ]
            },
            examples: null,
            variants: null
        },
        naq: {
            message: {
                br: [
                    "escolher",
                    "selecionar",
                    "preferir"
                ]
            },
            examples: null,
            variants: null
        },
        naz: {
            message: {
                br: [
                    "descansar"
                ]
            },
            examples: null,
            variants: null
        },
        neh: {
            message: {
                br: [
                    "nascer"
                ]
            },
            examples: null,
            variants: null
        },
        nhu: {
            message: {
                br: [
                    "alterar",
                    "modificar",
                    "mudar"
                ]
            },
            examples: null,
            variants: null
        },
        nih: {
            message: {
                br: [
                    "renascer"
                ]
            },
            examples: null,
            variants: null
        },
        nog: {
            message: {
                br: [
                    "chegar",
                    "vir"
                ]
            },
            examples: null,
            variants: null
        },
        obs: {
            message: {
                br: [
                    "observar"
                ]
            },
            examples: null,
            variants: null
        },
        ofi: {
            message: {
                br: [
                    "trepar"
                ]
            },
            examples: null,
            variants: null
        },
        oky: {
            message: {
                br: [
                    "agradecer"
                ]
            },
            examples: null,
            variants: null
        },
        ole: {
            message: {
                br: [
                    "apagar"
                ]
            },
            examples: null,
            variants: null
        },
        olf: {
            message: {
                br: [
                    "remover"
                ]
            },
            examples: null,
            variants: null
        },
        olg: {
            message: {
                br: [
                    "acabar"
                ]
            },
            examples: null,
            variants: null
        },
        oli: {
            message: {
                br: [
                    "dar"
                ]
            },
            examples: null,
            variants: null
        },
        olk: {
            message: {
                br: [
                    "adiar"
                ]
            },
            examples: null,
            variants: null
        },
        ori: {
            message: {
                br: [
                    "fechar"
                ]
            },
            examples: null,
            variants: null
        },
        par: {
            message: {
                br: [
                    "enfiar"
                ]
            },
            examples: null,
            variants: null
        },
        pie: {
            message: {
                br: [
                    "viajar"
                ]
            },
            examples: null,
            variants: null
        },
        pka: {
            message: {
                br: [
                    "sapatear"
                ]
            },
            examples: null,
            variants: null
        },
        plk: {
            message: {
                br: [
                    "responder"
                ]
            },
            examples: null,
            variants: null
        },
        plo: {
            message: {
                br: [
                    "abrir"
                ]
            },
            examples: null,
            variants: null
        },
        pod: {
            message: {
                br: [
                    "poder"
                ]
            },
            examples: null,
            variants: null
        },
        pop: {
            message: {
                br: [
                    "continuar",
                    "seguir",
                    "prosseguir"
                ]
            },
            examples: null,
            variants: null
        },
        pra: {
            message: {
                br: [
                    "escutar"
                ]
            },
            examples: null,
            variants: null
        },
        pre: {
            message: {
                br: [
                    "assinar",
                    "declarar"
                ]
            },
            examples: null,
            variants: null
        },
        pri: {
            message: {
                br: [
                    "entrar",
                    "visitar"
                ]
            },
            examples: null,
            variants: null
        },
        qne: {
            message: {
                br: [
                    "desejar",
                    "pedir",
                    "querer"
                ]
            },
            examples: null,
            variants: null
        },
        qnm: {
            message: {
                br: [
                    "salvar"
                ]
            },
            examples: null,
            variants: null
        },
        rai: {
            message: {
                br: [
                    "chamar",
                    "ligar",
                    "telefonar"
                ]
            },
            examples: null,
            variants: null
        },
        rau: {
            message: {
                br: [
                    "imaginar",
                    "pensar",
                    "sonhar"
                ]
            },
            examples: null,
            variants: null
        },
        reh: {
            message: {
                br: [
                    "pagar"
                ]
            },
            examples: null,
            variants: null
        },
        rka: {
            message: {
                br: [
                    "gravar"
                ]
            },
            examples: null,
            variants: null
        },
        rud: {
            message: {
                br: [
                    "prestar"
                ]
            },
            examples: null,
            variants: null
        },
        ruh: {
            message: {
                br: [
                    "sair"
                ]
            },
            examples: null,
            variants: null
        },
        rye: {
            message: {
                br: [
                    "enviar",
                    "escrever"
                ]
            },
            examples: null,
            variants: null
        },
        ryi: {
            message: {
                br: [
                    "passar"
                ]
            },
            examples: null,
            variants: null
        },
        saa: {
            message: {
                br: [
                    "prometer"
                ]
            },
            examples: null,
            variants: null
        },
        saf: {
            message: {
                br: [
                    "abusar"
                ]
            },
            examples: null,
            variants: null
        },
        sak: {
            message: {
                br: [
                    "faltar"
                ]
            },
            examples: null,
            variants: null
        },
        sea: {
            message: {
                br: [
                    "comprometer"
                ]
            },
            examples: null,
            variants: null
        },
        sek: {
            message: {
                br: [
                    "colocar",
                    "por"
                ]
            },
            examples: null,
            variants: null
        },
        sem: {
            message: {
                br: [
                    "deixar"
                ]
            },
            examples: null,
            variants: null
        },
        sfy: {
            message: {
                br: [
                    "filosofar"
                ]
            },
            examples: null,
            variants: null
        },
        sih: {
            message: {
                br: [
                    "começar",
                    "iniciar",
                    "jogar"
                ]
            },
            examples: null,
            variants: null
        },
        ska: {
            message: {
                br: [
                    "dançar"
                ]
            },
            examples: null,
            variants: null
        },
        sle: {
            message: {
                br: [
                    "faxinar"
                ]
            },
            examples: null,
            variants: null
        },
        squ: {
            message: {
                br: [
                    "monitorar"
                ]
            },
            examples: null,
            variants: null
        },
        sru: {
            message: {
                br: [
                    "tentar"
                ]
            },
            examples: null,
            variants: null
        },
        sue: {
            message: {
                br: [
                    "abraçar"
                ]
            },
            examples: null,
            variants: null
        },
        suk: {
            message: {
                br: [
                    "editar"
                ]
            },
            examples: null,
            variants: null
        },
        swa: {
            message: {
                br: [
                    "pirar"
                ]
            },
            examples: null,
            variants: null
        },
        swi: {
            message: {
                br: [
                    "voltar",
                    "desfazer"
                ]
            },
            examples: null,
            variants: null
        },
        tar: {
            message: {
                br: [
                    "ter"
                ]
            },
            examples: null,
            variants: null
        },
        tbd: {
            message: {
                br: [
                    "melhorar",
                    "sarar",
                    "revigorar",
                    "recuperar",
                    "restaurar",
                    "resistir"
                ]
            },
            examples: null,
            variants: null
        },
        tnu: {
            message: {
                br: [
                    "sobreviver",
                    "viver"
                ]
            },
            examples: null,
            variants: null
        },
        tol: {
            message: {
                br: [
                    "ganhar",
                    "vencer"
                ]
            },
            examples: null,
            variants: null
        },
        top: {
            message: {
                br: [
                    "ficar"
                ]
            },
            examples: null,
            variants: null
        },
        tra: {
            message: {
                br: [
                    "importar"
                ]
            },
            examples: null,
            variants: null
        },
        tre: {
            message: {
                br: [
                    "aceitar"
                ]
            },
            examples: null,
            variants: null
        },
        tua: {
            message: {
                br: [
                    "socializar"
                ]
            },
            examples: null,
            variants: null
        },
        tue: {
            message: {
                br: [
                    "estar",
                    "ser"
                ]
            },
            examples: null,
            variants: null
        },
        tyh: {
            message: {
                br: [
                    "cuidar"
                ]
            },
            examples: null,
            variants: null
        },
        ugs: {
            message: {
                br: [
                    "retornar",
                    "voltar"
                ]
            },
            examples: null,
            variants: null
        },
        uhm: {
            message: {
                br: [
                    "precisar"
                ]
            },
            examples: null,
            variants: null
        },
        uls: {
            message: {
                br: [
                    "mandar",
                    "obrigar",
                    "tachar",
                    "taxar"
                ]
            },
            examples: null,
            variants: {
                ulsku: {
                    message: {
                        br: [
                            "mandado",
                            "mandatório",
                            "obrigatório",
                            "obrigação",
                            "obrigado",
                            "tacha",
                            "taxa",
                            "taxação"
                        ]
                    }
                }
            }
        },
        ulu: {
            message: {
                br: [
                    "dividir",
                    "analisar"
                ]
            },
            examples: null,
            variants: null
        },
        uru: {
            message: {
                br: [
                    "memorizar"
                ]
            },
            examples: null,
            variants: null
        },
        uwe: {
            message: {
                br: [
                    "aguardar",
                    "esperar"
                ]
            },
            examples: null,
            variants: null
        },
        uwo: {
            message: {
                br: [
                    "cozinhar"
                ]
            },
            examples: null,
            variants: null
        },
        uyo: {
            message: {
                br: [
                    "amar"
                ]
            },
            examples: null,
            variants: null
        },
        waa: {
            message: {
                br: [
                    "ousar"
                ]
            },
            examples: null,
            variants: null
        },
        wab: {
            message: {
                br: [
                    "trocar"
                ]
            },
            examples: null,
            variants: null
        },
        wae: {
            message: {
                br: [
                    "correr",
                    "avançar",
                    "pular"
                ]
            },
            examples: null,
            variants: null
        },
        waf: {
            message: {
                br: [
                    "concluir"
                ]
            },
            examples: null,
            variants: {
                awfku: {
                    message: {
                        br: [
                            "concluído"
                        ]
                    }
                }
            }
        },
        wah: {
            message: {
                br: [
                    "andar"
                ]
            },
            examples: null,
            variants: null
        },
        wre: {
            message: {
                br: [
                    "cercar"
                ]
            },
            examples: null,
            variants: null
        },
        wri: {
            message: {
                br: [
                    "reclamar"
                ]
            },
            examples: null,
            variants: null
        },
        wug: {
            message: {
                br: [
                    "cansar"
                ]
            },
            examples: null,
            variants: null
        },
        wum: {
            message: {
                br: [
                    "acordar",
                    "amanhecer",
                    "alvorecer",
                    "madrugar"
                ]
            },
            examples: null,
            variants: {
                wumku: {
                    message: {
                        br: [
                            "acordado",
                            "amanhecido",
                            "alvorecido",
                            "madrugada",
                            "madrugado"
                        ]
                    }
                }
            }
        },
        wyt: {
            message: {
                br: [
                    "cortar",
                    "machucar"
                ]
            },
            examples: null,
            variants: null
        },
        xur: {
            message: {
                br: [
                    "atender"
                ]
            },
            examples: null,
            variants: null
        },
        yaa: {
            message: {
                br: [
                    "significar",
                    "valer"
                ]
            },
            examples: null,
            variants: null
        },
        yhe: {
            message: {
                br: [
                    "esquecer"
                ]
            },
            examples: null,
            variants: null
        },
        yio: {
            message: {
                br: [
                    "abandonar"
                ]
            },
            examples: null,
            variants: null
        },
        yte: {
            message: {
                br: [
                    "aproximar"
                ]
            },
            examples: null,
            variants: null
        },
        zno: {
            message: {
                br: [
                    "sentir"
                ]
            },
            examples: null,
            variants: null
        },
        zon: {
            message: {
                br: [
                    "saber"
                ]
            },
            examples: null,
            variants: null
        },
        zuh: {
            message: {
                br: [
                    "morrer"
                ]
            },
            examples: null,
            variants: null
        },
        anne: {
            message: {
                br: [
                    "macaco"
                ]
            },
            examples: null,
            variants: null
        },
        abia: {
            message: {
                br: [
                    "lama",
                    "terra",
                ]
            },
            old_message: {
                br: [
                    "sujeira",
                    "sujo"
                ]
            },            
            examples: null,
            variants: null,
            replacements: [
                "lukku"
            ]
        },
        aete: {
            message: {
                br: [
                    "nome",
                    "identificação",
                    "palavra",
                    "título"
                ]
            },
            examples: null,
            variants: null
        },
        afoh: {
            message: {
                br: [
                    "pet",
                    "estimação",
                    "subordinado",
                    "dependente",
                    "derivado",
                    "originado"
                ]
            },
            examples: null,
            variants: {
                niafoh: {
                    message: {
                        br: [
                            "cadela"
                        ]
                    }
                },
                naafoh: {
                    message: {
                        br: [
                            "cachorro"
                        ]
                    }
                }
            }
        },
        ahli: {
            message: {
                br: [
                    "área"
                ]
            },
            examples: null,
            variants: null
        },
        ahly: {
            message: {
                br: [
                    "ilha",
                    "monte",
                    "círculo"
                ]
            },
            old_message: {
                br: [
                    "área"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "ahli"
            ]
        },
        alfk: {
            message: {
                br: [
                    "dom",
                    "habilidade"
                ]
            },
            examples: null,
            variants: null
        },
        alul: {
            message: {
                br: [
                    "cavalo"
                ]
            },
            examples: null,
            variants: {
                nialul: {
                    message: {
                        br: [
                            "égua"
                        ]
                    }
                },
                naalul: {
                    message: {
                        br: [
                            "cavalo"
                        ]
                    }
                }
            }
        },
        amya: {
            message: {
                br: [
                    "tanto",
                    "tantos",
                    "tantas",
                    "tão"
                ]
            },
            examples: null,
            variants: null
        },
        anoa: {
            message: {
                br: [
                    "sol",
                    "fogo",
                    "quente",
                    "fogueira",
                    "verão"
                ]
            },
            examples: null,
            variants: null,
            old_message: {
                br: [
                    "destaque",
                    "destacado",
                    "foco",
                    "argumento",
                    "fonte",
                    "centro",
                    "origem",
                    "ponto"
                ]
            },
            replacements: [
                "gkuku",
                "anoe"
            ]
        },
        anoe: {
            message: {
                br: [
                    "fonte",
                    "centro",
                    "origem",
                    "ponto"
                ]
            },
            examples: null,
            variants: null
        },
        aout: {
            message: {
                br: [
                    "tomada",
                    "plugue",
                    "encaixe",
                    "conector",
                    "buraco",
                    "túnel",
                    "viaduto",
                    "veia",
                    "artéria",
                    "via"
                ]
            },
            examples: null,
            variants: null
        },
        asse: {
            message: {
                br: [
                    "possível",
                    "provável",
                    "possibilidade",
                    "chance",
                    "oportunidade"
                ]
            },
            examples: null,
            variants: null
        },
        aved: {
            message: {
                br: [
                    "talvez"
                ]
            },
            examples: null,
            variants: null
        },
        awfo: {
            message: {
                br: [
                    "recuperação",
                    "conserto",
                    "correção"
                ]
            },
            examples: null,
            variants: null
        },
        bala: {
            message: {
                br: [
                    "maçã"
                ]
            },
            examples: null,
            variants: null
        },
        bduh: {
            message: {
                br: [
                    "bobo",
                    "palhaço",
                    "animador",
                    "humorista"
                ]
            },
            examples: null,
            variants: null
        },
        bite: {
            message: {
                br: [
                    "ano",
                    "luz",
                    "luminosidade",
                    "energia"
                ]
            },
            examples: null,
            variants: null
        },
        blar: {
            message: {
                br: [
                    "conversa",
                    "papo",
                    "mensagem",
                    "comentário"
                ]
            },
            examples: null,
            variants: null
        },
        body: {
            message: {
                br: [
                    "bolo",
                    "massa",
                    "alimento",
                    "pasta",
                    "conjunto",
                    "molho",
                    "lista",
                    "vetor",
                    "pasta",
                    "arquivo"
                ]
            },
            examples: null,
            variants: null
        },
        bofo: {
            message: {
                br: [
                    "brócolis"
                ]
            },
            examples: null,
            variants: null
        },
        brad: {
            message: {
                br: [
                    "pão",
                    "massa"
                ]
            },
            examples: null,
            variants: null
        },
        brod: {
            message: {
                br: [
                    "ingerível",
                    "comestível"
                ]
            },
            old_message: {
                br: [
                    "comida",
                    "alimento",
                    "refeição",
                    "lanche",
                    "piquenique",
                    "remédio",
                    "medicamento",
                    "tratamento",
                    "cura"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "algku",
                "euyt"
            ]
        },
        brot: {
            message: {
                br: [
                    "boca",
                    "orifício"
                ]
            },
            examples: null,
            variants: null
        },
        brum: {
            message: {
                br: [
                    "cotovelo",
                    "canto",
                    "maluco",
                    "doido",
                    "insano",
                    "maravilha",
                    "maravilhoso",
                    "incrível"
                ]
            },
            examples: null,
            variants: null
        },
        brus: {
            message: {
                br: [
                    "ônibus",
                    "transporte",
                    "multidão",
                    "conjunto",
                    "grupo",
                    "turma"
                ]
            },
            examples: null,
            variants: null
        },
        buno: {
            message: {
                br: [
                    "traseira",
                    "trás",
                    "ânus"
                ]
            },
            examples: null,
            variants: null
        },
        bvor: {
            message: {
                br: [
                    "executável",
                    "jogo",
                    "programa",
                    "código",
                    "aplicativo",
                    "programa",
                    "calendário",
                    "rotina",
                    "roteiro"
                ]
            },
            examples: null,
            variants: null
        },
        carr: {
            message: {
                br: [
                    "caro",
                    "custoso",
                    "cansativo",
                    "demorado",
                    "desgastante"
                ]
            },
            examples: null,
            variants: null
        },
        cite: {
            message: {
                br: [
                    "cinco"
                ]
            },
            examples: null,
            variants: null
        },
        cloc: {
            message: {
                br: [
                    "feijão",
                    "borrado",
                    "oblíquo",
                    "esquecido",
                    "confuso"
                ]
            },
            examples: null,
            variants: null
        },
        clon: {
            message: {
                br: [
                    "com",
                    "como"
                ]
            },
            examples: null,
            variants: null
        },
        colk: {
            message: {
                br: [
                    "mistura",
                    "prato",
                    "feijoada"
                ]
            },
            examples: null,
            variants: null
        },
        coln: {
            message: {
                br: [
                    "controle",
                    "ferramenta",
                    "controlador",
                    "administrador"
                ]
            },
            examples: null,
            variants: null
        },
        crar: {
            message: {
                br: [
                    "automotivo",
                    "carro",
                    "transporte",
                    "meio",
                    "ferramenta mecânica que ajuda no movimento de algo",
                    "meio de transporte de um objeto ou ser vivo por algum meio mecânico"
                ]
            },
            examples: null,
            variants: null
        },
        cret: {
            message: {
                br: [
                    "sobrancelha",
                    "expressão",
                    "algo que expresse sentimento ou emoção",
                    "forma de dizer algo"
                ]
            },
            examples: null,
            variants: null
        },
        crue: {
            message: {
                br: [
                    "burro",
                    "burra",
                    "jumento",
                    "jumenta"
                ]
            },
            examples: null,
            variants: null
        },
        cruy: {
            message: {
                br: [
                    "mundo",
                    "globo",
                    "planeta",
                    "um grande espaço",
                    "conjunto em um espaço",
                    "conjunto de algo",
                    "ecossistema",
                    "organismo"
                ]
            },
            examples: null,
            variants: null
        },
        daeh: {
            message: {
                br: [
                    "colega",
                    "membro",
                    "participante de um grupo",
                    "de uma turma",
                    "conhecido amigável"
                ]
            },
            examples: null,
            variants: null
        },
        dayh: {
            message: {
                br: [
                    "sócio",
                    "membro de alta classe de um grupo",
                    "dono",
                    "criador",
                    "mestre",
                    "administração"
                ]
            },
            examples: null,
            variants: null
        },
        daew: {
            message: {
                br: [
                    "externo",
                    "fora",
                    "vizinho",
                    "estrangeiro",
                    "desconhecido",
                    "novo na área não conhecido pelo bairro",
                    "importado"
                ]
            },
            examples: null,
            variants: null
        },
        dafk: {
            message: {
                br: [
                    "cabeça",
                    "parte superior",
                    "controle",
                    "cérebro",
                    "aquele ou aquilo que controla ou direciona",
                    "volante",
                    "guidão"
                ]
            },
            examples: null,
            variants: null
        },
        daih: {
            message: {
                br: [
                    "adulto",
                    "maior de idade",
                    "responsável",
                    "para maior de idade",
                    "inapropriado",
                    "nsfw"
                ]
            },
            examples: null,
            variants: null
        },
        daiw: {
            message: {
                br: [
                    "interno",
                    "dentro",
                    "submerso",
                    "debaixo",
                    "coberto",
                    "profundo",
                    "fundo",
                    "bem abaixo",
                ]
            },
            old_message: {
                br: [
                    "exportado",
                    "detalhado",
                    "bem feito",
                    "perfeccionista",
                    "perfeito"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "knap",
                "fual",
                "faqku"
            ]
        },
        daoh: {
            message: {
                br: [
                    "idoso",
                    "terceira idade",
                    "algo que parece velho",
                    "antigo",
                    "antiguidade"
                ]
            },
            examples: null,
            variants: null
        },
        dapa: {
            message: {
                br: [
                    "capaz",
                    "ter a capacidade de",
                    "que aguenta",
                    "tem força para carregar",
                    "forte",
                    "competente"
                ]
            },
            examples: null,
            variants: null
        },
        deft: {
            message: {
                br: [
                    "deficiente",
                    "com falta de",
                    "em falta",
                    "terminou",
                    "fim"
                ]
            },
            examples: null,
            variants: null
        },
        defy: {
            message: {
                br: [
                    "a criação em si",
                    "algo criado",
                    "algo novo criado ou transformado",
                    "novo",
                    "resultado de um trabalho criado",
                    "feito manualmente",
                    "preparado",
                    "feito",
                    "depois de um tempo"
                ]
            },
            examples: null,
            variants: null
        },
        delf: {
            message: {
                br: [
                    "fofo"
                ]
            },
            examples: null,
            variants: null
        },
        dept: {
            message: {
                br: [
                    "depois",
                    "após",
                    "posterior"
                ]
            },
            examples: null,
            variants: null
        },
        dlet: {
            message: {
                br: [
                    "principal",
                    "preciso",
                    "necessário",
                    "importante",
                    "relevante",
                    "oficial",
                    "genuíno"
                ]
            },
            old_message: {
                br: [
                    "que aparece primeiro",
                    "se destaca ou é importante para o corpo ou objeto"
                ]
            },
            examples: null,
            variants: null,
            replacements: [

            ]
        },
        doht: {
            message: {
                br: [
                    "nada",
                    "nenhum",
                    "nulo",
                    "inexistente",
                    "sem traços",
                    "vazio",
                    "desaparecido",
                    "escondido",
                    "perdido"
                ]
            },
            examples: null,
            variants: null
        },
        dout: {
            message: {
                br: [
                    "doutor",
                    "pessoa com grande experiência em algo",
                    "com ensino completo em algo",
                    "doutorado"
                ]
            },
            examples: null,
            variants: null
        },
        dovk: {
            message: {
                br: [
                    "modo",
                    "meio",
                    "forma de fazer"
                ]
            },
            examples: null,
            variants: null
        },
        drib: {
            message: {
                br: [
                    "pelado",
                    "nu",
                    "nude",
                    "despido",
                    "sem roupa",
                    "original",
                    "puro",
                    "cru",
                    "completo",
                    "sem filtros",
                    "total",
                    "inteiro"
                ]
            },
            examples: null,
            variants: null
        },
        dtie: {
            message: {
                br: [
                    "digital",
                    "geralmente não mecânico",
                    "que funciona de forma digital"
                ]
            },
            examples: null,
            variants: null
        },
        dtye: {
            message: {
                br: [
                    "futurista",
                    "à frente",
                    "adiantado"
                ]
            },
            examples: null,
            variants: null
        },
        dude: {
            message: {
                br: [
                    "dois"
                ]
            },
            examples: null,
            variants: null
        },
        dued: {
            message: {
                br: [
                    "nota",
                    "resultado",
                    "valor"
                ]
            },
            examples: null,
            variants: null
        },
        duly: {
            message: {
                br: [
                    "plural",
                    "múltiplo"
                ]
            },
            examples: null,
            variants: null
        },
        duut: {
            message: {
                br: [
                    "nádega",
                    "bunda",
                    "parte traseira",
                    "que aparece por último"
                ]
            },
            examples: null,
            variants: null
        },
        dwat: {
            message: {
                br: [
                    "secreto",
                    "segredo",
                    "protegido",
                    "lacrado",
                    "mantido fora do alcance"
                ]
            },
            examples: null,
            variants: null
        },
        ebae: {
            message: {
                br: [
                    "asfalto"
                ]
            },
            examples: null,
            variants: null
        },
        edof: {
            message: {
                br: [
                    "dinheiro",
                    "moeda"
                ]
            },
            examples: null,
            variants: null
        },
        egka: {
            message: {
                br: [
                    "ave",
                    "pássaro",
                    "algo que voe",
                    "avião",
                    "águia"
                ]
            },
            examples: null,
            variants: null
        },
        eitd: {
            message: {
                br: [
                    "analógico",
                    "mecânico",
                    "natural"
                ]
            },
            examples: null,
            variants: null
        },
        elgh: {
            message: {
                br: [
                    "duro",
                    "rígido",
                    "resistente",
                    "egoísta"
                ]
            },
            examples: null,
            variants: null
        },
        enge: {
            message: {
                br: [
                    "engenharia",
                    "engenheiro"
                ]
            },
            examples: null,
            variants: null
        },
        esge: {
            message: {
                br: [
                    "artista",
                    "aquele que desenha",
                    "cria arte",
                    "criativo",
                    "inovador",
                    "que pensa fora da caixa"
                ]
            },
            examples: null,
            variants: null
        },
        esiu: {
            message: {
                br: [
                    "difícil",
                    "complicado",
                    "fechado",
                    "difícil acesso",
                    "trancado"
                ]
            },
            examples: null,
            variants: null
        },
        esja: {
            message: {
                br: [
                    "dificuldade",
                    "resistência",
                    "força contra",
                    "defesa",
                    "defensivo"
                ]
            },
            examples: null,
            variants: null
        },
        espa: {
            message: {
                br: [
                    "pois",
                    "por que",
                    "porque",
                    "por quê",
                    "porquê"
                ]
            },
            examples: [
                {
                    phrase: "wu espa eu dyd lolk ae?",
                    message: {
                        br: [
                            "por que eu duvido de você?"
                        ]
                    }
                }
            ],
            variants: null
        },
        espe: {
            message: {
                br: [
                    "alface"
                ]
            },
            examples: null,
            variants: null
        },
        etit: {
            message: {
                br: [
                    "data",
                    "dia",
                    "reserva",
                    "encontro"
                ]
            },
            examples: null,
            variants: null
        },
        eurt: {
            message: {
                br: [
                    "fraco",
                    "frágil",
                    "inseguro"
                ]
            },
            old_message: {
                br: [
                    "temporário",
                    "alugado"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "pury"
            ]
        },
        euyt: {
            message: {
                br: [
                    "vacina",
                    "cura",
                    "seringa",
                    "remédio",
                    "drogas",
                    "medicamento",
                    "tratamento"
                ]
            },
            examples: null,
            variants: null
        },
        ewrk: {
            message: {
                br: [
                    "borracha",
                    "pneu"
                ]
            },
            examples: null,
            variants: null
        },
        fafa: {
            message: {
                br: [
                    "minuto"
                ]
            },
            examples: null,
            variants: null
        },
        fafs: {
            message: {
                br: [
                    "velho",
                    "idoso",
                    "antigo",
                    "clássico"
                ]
            },
            examples: null,
            variants: null
        },
        fakk: {
            message: {
                br: [
                    "obrigado",
                    "agradecido",
                    "agradecimento"
                ]
            },
            examples: null,
            variants: null
        },
        fein: {
            message: {
                br: [
                    "combustível",
                    "origem",
                    "herança",
                    "fonte",
                    "pesquisa"
                ]
            },
            examples: null,
            variants: null
        },
        feni: {
            message: {
                br: [
                    "acima",
                    "em cima",
                    "cima",
                    "sobre",
                    "superior",
                    "por cima"
                ]
            },
            old_message: {
                br: [
                    "maior",
                    "mais (em algo)"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "jolo"
            ]
        },
        fert: {
            message: {
                br: [
                    "professor",
                    "orientador",
                    "comandante",
                    "o que ensina",
                    "o que orienta ou comanda com um objetivo educacional ou prático"
                ]
            },
            examples: null,
            variants: null
        },
        fery: {
            message: {
                br: [
                    "parte",
                    "pedaço",
                    "contexto",
                    "membro",
                    "órgão"
                ]
            },
            examples: null,
            variants: null
        },
        fglu: {
            message: {
                br: [
                    "normal",
                    "padrão",
                    "universal"
                ]
            },
            examples: null,
            variants: null
        },
        fhlo: {
            message: {
                br: [
                    "automático",
                    "individual",
                    "faz-tudo"
                ]
            },
            examples: null,
            variants: null
        },
        fini: {
            message: {
                br: [
                    "agudo",
                    "pontudo",
                    "alta frequência",
                    "especial"
                ]
            },
            old_message: {
                br: [
                    "alto",
                    "singular",
                    "único"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nofy",
                "phlo"
            ]
        },
        flai: {
            message: {
                br: [
                    "álcool",
                    "líquido (como para automóveis ou limpeza)",
                    "bebida alcoólica"
                ]
            },
            examples: null,
            variants: null
        },
        flar: {
            message: {
                br: [
                    "impressora",
                    "equipamento que imprime",
                    "impressionador",
                    "que impressiona",
                    "causa impressão",
                    "cópia",
                    "semelhante"
                ]
            },
            examples: null,
            variants: null
        },
        flei: {
            message: {
                br: [
                    "ouvido",
                    "audição",
                    "microfone",
                    "dispositivo de captura de som ou frequência",
                    "frequencímetro",
                    "gravador",
                    "aparelho de som (para captura de som)"
                ]
            },
            examples: null,
            variants: null
        },
        flix: {
            message: {
                br: [
                    "gato",
                    "felino",
                    "cheio de energia",
                    "radical",
                    "animal"
                ]
            },
            examples: null,
            variants: null
        },
        floi: {
            message: {
                br: [
                    "diesel",
                    "combustível de fácil explosão",
                    "pessoa sensível a variações",
                    "ansiedade",
                    "ansioso"
                ]
            },
            examples: null,
            variants: null
        },
        flui: {
            message: {
                br: [
                    "gasolina",
                    "pessoa atraente",
                    "que causa calor",
                    "alimento",
                    "fonte",
                    "causa"
                ]
            },
            examples: null,
            variants: null
        },
        fout: {
            message: {
                br: [
                    "tórax",
                    "peitoral",
                    "frente de um corpo",
                    "proteção frontal de algo importante",
                    "capô",
                    "armadura",
                    "roupa extremamente resistente",
                    "tampa",
                    "fechadura",
                    "trava",
                    "cadeado",
                    "bloqueado",
                    "trancado",
                    "fechado"
                ]
            },
            examples: null,
            variants: null
        },
        fouk: {
            message: {
                br: [
                    "seio",
                    "curva",
                    "sinuosidade",
                    "o mais interno de um ser",
                    "alma",
                    "espírito",
                    "cavidade",
                    "canal interno que contém ou por onde passa algo",
                    "buraco",
                    "túnel",
                    "passagem"
                ]
            },
            examples: null,
            variants: null
        },
        fpra: {
            message: {
                br: [
                    "conta",
                    "contato"
                ]
            },
            examples: null,
            variants: null
        },
        fpri: {
            message: {
                br: [
                    "documento",
                    "arquivo",
                    "identidade",
                    "identificador"
                ]
            },
            old_message: {
                br: [
                    "folha",
                    "identidade",
                    "registro",
                    "traço",
                    "pista",
                    "conta",
                    "contato"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "decku",
                "fpra",
                "relo"
            ]
        },
        frav: {
            message: {
                br: [
                    "ser aquilo ou aquilo que tem entre as pernas (definido pelo sexo ou indefinido caso não interessado",
                    "genitália"
                ]
            },
            examples: [
                {
                    phrase: "ue tue nifrav",
                    message: {
                        br: [
                            "eu sou mulher",
                            "eu tenho (um órgão do sexo feminino)"
                        ]
                    }
                },
                {
                    phrase: "ue tue nafrav",
                    message: {
                        br: [
                            "eu sou homem",
                            "eu tenho (um órgão do sexo masculino)"
                        ]
                    }
                }
            ],
            variants: null
        },
        fraq: {
            message: {
                br: [
                    "ser aquele que tem interesse em um sexo específico ou ambos (veja exemplos)"
                ]
            },
            examples: [
                {
                    phrase: "nifraq",
                    message: {
                        br: [
                            "interessado em sexo feminino (homossexual ou hétero dependendo do sujeito)"
                        ]
                    }
                },
                {
                    phrase: "nafraq",
                    message: {
                        br: [
                            "interessado em sexo masculino (homossexual ou hétero dependendo do sujeito)"
                        ]
                    }
                },
                {
                    phrase: "fraq",
                    message: {
                        br: [
                            "interessado em qualquer sexo ou indefinido"
                        ]
                    }
                }
            ],
            variants: null
        },
        frax: {
            message: {
                br: [
                    "bomba",
                    "mina",
                    "granada",
                    "explosivo",
                    "spam",
                    "irritante",
                    "o que não se quer perto"
                ]
            },
            examples: null,
            variants: null
        },
        frea: {
            message: {
                br: [
                    "carne",
                    "material de origem animal",
                    "couro"
                ]
            },
            examples: null,
            variants: null
        },
        frex: {
            message: {
                br: [
                    "colega próximo",
                    "parceiro",
                    "dupla",
                    "faz parte de sua equipe pessoal"
                ]
            },
            examples: null,
            variants: null
        },
        froc: {
            message: {
                br: [
                    "rocha",
                    "pedra",
                    "duro",
                    "resistente",
                    "persistente ou cabeça dura",
                    "pouco valioso",
                    "comum"
                ]
            },
            examples: null,
            variants: null
        },
        frot: {
            message: {
                br: [
                    "frita",
                    "tostada com calor",
                    "queimado",
                    "colocado à lenha rapidamente",
                    "febre",
                    "acima da temperatura normal",
                    "aquecido de forma irregular",
                    "machucado de queimar (tanto emocional quanto real)"
                ]
            },
            examples: null,
            variants: null
        },
        fruf: {
            message: {
                br: [
                    "pelo",
                    "pelugem",
                    "pena",
                    "plumagem (caso esteja falando de aves)",
                    "cobertura",
                    "cobertor",
                    "algo que cobre e mantém quente ou protege de algo",
                    "armadura mística ou especial que te mantém protegido"
                ]
            },
            examples: null,
            variants: null
        },
        ftik: {
            message: {
                br: [
                    "forçado",
                    "feito sob medida",
                    "apertado",
                    "planejado perfeitamente",
                    "limitado",
                    "pressionado (a fazer algo)",
                    "obrigado"
                ]
            },
            examples: null,
            variants: null
        },
        ftuk: {
            message: {
                br: [
                    "sanduíche",
                    "hambúrguer"
                ]
            },
            examples: null,
            variants: null
        },
        fual: {
            message: {
                br: [
                    "decente",
                    "bem feito",
                    "bem trabalhado",
                    "robusto",
                    "competente",
                    "garantido",
                    "preparado (bem)",
                    "organizado (de forma decente)",
                    "encaixado perfeitamente (com um conector bem colocado)",
                    "combinado (em cor, formato ou qualquer outra característica)",
                    "conectado (com perfeição ou com grandes garantias de sucesso)",
                    "montado perfeitamente",
                    "construído sem erros",
                    "que dá orgulho",
                    "bem composto",
                    "bem misturado",
                    "destaque entre outros"
                ]
            },
            examples: null,
            variants: null
        },
        fuil: {
            message: {
                br: [
                    "bem",
                    "bom",
                    "feliz",
                    "alegre",
                    "positivo",
                    "felicidade"
                ]
            },
            old_message: {
                br: [
                    "certo",
                    "correto",
                    "perfeitamente bem",
                    "bem cuidado",
                    "em perfeitas condições"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "knep"
            ]
        },
        fury: {
            message: {
                br: [
                    "ser vivo",
                    "corpo com vida",
                    "animal",
                    "espontâneo",
                    "animado",
                    "motivado",
                    "independente",
                    "maduro",
                    "adulto (parecer adulto)",
                    "responsável"
                ]
            },
            examples: null,
            variants: null
        },
        fytu: {
            message: {
                br: [
                    "nenhum",
                    "ninguém",
                    "vazio",
                    "desocupado",
                    "sem gente",
                    "desistente",
                    "cancelado",
                    "estar fora",
                    "sem ninguém",
                    "sozinho",
                    "assexual",
                    "sem interesses",
                    "sem desejos",
                    "inativo",
                    "ausente"
                ]
            },
            examples: null,
            variants: null
        },
        gale: {
            message: {
                br: [
                    "acesso",
                    "entrada",
                    "acessibilidade",
                    "assistência"
                ]
            },
            old_message: {
                br: [
                    "porta",
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "rwes"
            ]
        },
        game: {
            message: {
                br: [
                    "pá",
                    "ferramenta manual para escavar"
                ]
            },
            old_message: {
                br: [
                    "paz",
                    "símbolo de paz",
                    "estar calmo",
                    "sem estresse",
                    "relaxado",
                    "conquistar terras",
                    "novo território",
                    "conquista",
                    "com sucesso e pacífico",
                    "terminar algo sem estresse",
                    "na calma"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "furku"
            ]
        },
        gatx: {
            message: {
                br: [
                    "lindo",
                    "belo",
                    "bonito",
                    "elegante",
                    "gostoso"
                ]
            },
            old_message: {
                br: [
                    "bem feito",
                    "bem trabalhado",
                    "que dá orgulho",
                    "bem composto",
                    "bem misturado",
                    "destaque entre outros"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "fual"
            ]
        },
        gaty: {
            message: {
                br: [
                    "bem produzido",
                    "sem falhas",
                    "perfeito (dado algo para comparar)",
                    "exemplar",
                    "ideal",
                    "molde",
                    "norma",
                    "original",
                    "marca",
                    "exemplo",
                    "modelo"
                ]
            },
            examples: null,
            variants: null
        },
        gdaj: {
            message: {
                br: [
                    "socorro",
                    "ajuda (não necessariamente médica)",
                    "pedido",
                    "carta",
                    "mensagem ou qualquer sinal pedindo ajuda",
                    "sinalização de emergência ou de assistência (local de origem ou vindo ao local)",
                    "substantivo indicando que está \"precisando de ajuda\"",
                    "doação",
                    "investimento",
                    "aplicação (para ajudar o próximo)"
                ]
            },
            examples: [
                {
                    phrase: "ae tue gdaj",
                    message: {
                        br: [
                            "você está \"precisando de ajuda\""
                        ]
                    }
                }
            ],
            variants: null
        },
        gefh: {
            message: {
                br: [
                    "mãe (não necessariamente mulher)",
                    "aquele que é reconhecido como o mais importante num grupo de pessoas",
                    "pessoa de alto valor num grupo, por mérito, honra, não por dinheiro ou poder",
                    "pai"
                ]
            },
            examples: null,
            variants: null
        },
        geft: {
            message: {
                br: [
                    "teclado",
                    "instrumentos de múltiplas teclas",
                    "interface de um dispositivo"
                ]
            },
            old_message: {
                br: [
                    "senha",
                    "palavra-chave",
                    "resposta",
                    "chave",
                    "ponto importante",
                    "relevante"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "klai",
                "tahi",
                "dlet"
            ]
        },
        gflu: {
            message: {
                br: [
                    "estranho",
                    "alienígena",
                    "intruso",
                    "irregular",
                    "diferente",
                    "fora do padrão",
                    "incomum",
                    "desconhecido",
                    "novo"
                ]
            },
            examples: null,
            variants: null
        },
        gfoh: {
            message: {
                br: [
                    "desde",
                    "a partir de",
                    "a datar de",
                    "a contar de",
                    "com início em"
                ]
            },
            old_message: {
                br: [
                    "já",
                    "já em",
                    "agora",
                    "imediatamente",
                    "no momento",
                    "nesse momento"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "grah"
            ]
        },
        ghea: {
            message: {
                br: [
                    "geografia",
                    "terreno",
                    "área",
                    "lugar",
                    "região",
                    "vizinhança",
                    "bairro",
                    "pólis",
                    "comunidade",
                    "cidade-estado"
                ]
            },
            examples: null,
            variants: null
        },
        ghit: {
            message: {
                br: [
                    "sob",
                    "abaixo",
                    "embaixo",
                    "submerso",
                    "afundado",
                    "tampado",
                    "sobreposto por algo",
                    "protegido",
                    "escondido por baixo de algo",
                    "em segurança",
                    "isolado",
                    "controlado",
                    "vistoriado"
                ]
            },
            examples: null,
            variants: null
        },
        gleh: {
            message: {
                br: [
                    "mole",
                    "flácido",
                    "flexível",
                    "demorado",
                    "tardio",
                    "pausado",
                    "líquido (estado da matéria)"
                ]
            },
            examples: null,
            variants: null
        },
        glut: {
            message: {
                br: [
                    "círculo",
                    "esfera",
                    "objeto radial sem cantos",
                    "grupo",
                    "quadrilha",
                    "conjunto",
                    "equipe"
                ]
            },
            examples: null,
            variants: null
        },
        goto: {
            message: {
                br: [
                    "botão",
                    "brinco",
                    "pingente",
                    "gema",
                    "broto",
                    "raiz",
                    "origem",
                    "base originária",
                    "início",
                    "ponto",
                    "centro",
                    "destaque",
                    "tacha",
                    "tarefa",
                    "problema",
                    "origem de trabalho"
                ]
            },
            examples: null,
            variants: null
        },
        graf: {
            message: {
                br: [
                    "mesmo",
                    "ainda",
                    "próprio",
                    "tal",
                    "precisamente",
                    "exatamente",
                    "justamente"
                ]
            },
            old_message: {
                br: [
                    "até",
                    "também",
                    "inclusive"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "klin",
                "yhrn"
            ]
        },
        grah: {
            message: {
                br: [
                    "já",
                    "já em",
                    "agora",
                    "imediatamente",
                    "neste momento",
                    "no momento",
                    "nesse momento",
                    "na hora"
                ]
            },
            examples: null,
            variants: null
        },
        grak: {
            message: {
                br: [
                    "bicho",
                    "verme"
                ]
            },
            examples: null,
            variants: null
        },
        grin: {
            message: {
                br: [
                    "guitarra",
                    "violão elétrico"
                ]
            },
            examples: null,
            variants: null
        },
        gren: {
            message: {
                br: [
                    "violão",
                    "instrumento de cordas",
                    "instrumento musical de cordas",
                    "que vibra",
                    "gera som por vibrações"
                ]
            },
            examples: null,
            variants: null
        },
        gron: {
            message: {
                br: [
                    "utilize => abdku"
                ]
            },
            examples: null,
            variants: null
        },
        grug: {
            message: {
                br: [
                    "abaixo",
                    "baixo",
                    "grave",
                    "fundo",
                    "profundo"
                ]
            },
            examples: null,
            variants: null
        },
        gruy: {
            message: {
                br: [
                    "leoa",
                    "leão",
                    "felino selvagem"
                ]
            },
            examples: null,
            variants: null
        },
        guni: {
            message: {
                br: [
                    "ideia",
                    "sugestão"
                ]
            },
            examples: null,
            variants: null
        },
        gura: {
            message: {
                br: [
                    "bola",
                    "esfera"
                ]
            },
            examples: null,
            variants: null
        },
        gure: {
            message: {
                br: [
                    "informação",
                    "notícia"
                ]
            },
            examples: null,
            variants: null
        },
        gyla: {
            message: {
                br: [
                    "ritmo",
                    "movimento"
                ]
            },
            examples: null,
            variants: null
        },
        gyth: {
            message: {
                br: [
                    "chocolate"
                ]
            },
            examples: null,
            variants: null
        },
        hugi: {
            message: {
                br: [
                    "conteúdo",
                    "matéria"
                ]
            },
            examples: null,
            variants: null
        },
        hune: {
            message: {
                br: [
                    "casamento"
                ]
            },
            examples: null,
            variants: null
        },
        hung: {
            message: {
                br: [
                    "sal"
                ]
            },
            examples: null,
            variants: null
        },
        hute: {
            message: {
                br: [
                    "casa"
                ]
            },
            examples: null,
            variants: null
        },
        huti: {
            message: {
                br: [
                    "ânus"
                ]
            },
            examples: null,
            variants: null
        },
        huty: {
            message: {
                br: [
                    "terreno",
                    "área",
                    "espaço (de médio tamanho, para uma casa ou poucas casas)"
                ]
            },
            examples: null,
            variants: null
        },
        huwg: {
            message: {
                br: [
                    "bosta",
                    "merda",
                    "fezes"
                ]
            },
            examples: null,
            variants: null
        },
        hyor: {
            message: {
                br: [
                    "rua"
                ]
            },
            examples: null,
            variants: null
        },
        iata: {
            message: {
                br: [
                    "título",
                    "topo"
                ]
            },
            examples: null,
            variants: null
        },
        iceb: {
            message: {
                br: [
                    "cebola"
                ]
            },
            examples: null,
            variants: null
        },
        igrn: {
            message: {
                br: [
                    "veado"
                ]
            },
            examples: null,
            variants: null
        },
        ihgl: {
            message: {
                br: [
                    "inglês"
                ]
            },
            examples: null,
            variants: null
        },
        ilpe: {
            message: {
                br: [
                    "caldo"
                ]
            },
            examples: null,
            variants: null
        },
        issu: {
            message: {
                br: [
                    "calcanhar"
                ]
            },
            examples: null,
            variants: null
        },
        isti: {
            message: {
                br: [
                    "ovíparo"
                ]
            },
            examples: null,
            variants: null
        },
        isto: {
            message: {
                br: [
                    "herbívoro"
                ]
            },
            examples: null,
            variants: null
        },
        itep: {
            message: {
                br: [
                    "tempero",
                    "orégano"
                ]
            },
            examples: null,
            variants: null
        },
        jfab: {
            message: {
                br: [
                    "faculdade"
                ]
            },
            examples: null,
            variants: null
        },
        jiak: {
            message: {
                br: [
                    "unidade",
                    "medida",
                    "dimensão",
                    "métrica",
                    "universo",
                    "tamanho"
                ]
            },
            examples: null,
            variants: null
        },
        jolo: {
            message: {
                br: [
                    "grande",
                    "maior",
                    "mais",
                    "muito",
                    "vários",
                    "bastante"
                ]
            },
            examples: null,
            variants: null
        },
        joqe: {
            message: {
                br: [
                    "joystick"
                ]
            },
            examples: null,
            variants: null
        },
        julk: {
            message: {
                br: [
                    "foda"
                ]
            },
            examples: null,
            variants: null
        },
        kaet: {
            message: {
                br: [
                    "pobre",
                    "pobreza"
                ]
            },
            examples: null,
            variants: null
        },
        kaga: {
            message: {
                br: [
                    "mercado",
                    "shopping"
                ]
            },
            examples: null,
            variants: null
        },
        kaka: {
            message: {
                br: [
                    "atrevido"
                ]
            },
            examples: null,
            variants: null
        },
        kala: {
            message: {
                br: [
                    "caramba"
                ]
            },
            examples: null,
            variants: null
        },
        kara: {
            message: {
                br: [
                    "loucura"
                ]
            },
            examples: null,
            variants: null
        },
        kark: {
            message: {
                br: [
                    "atualização"
                ]
            },
            examples: null,
            variants: null
        },
        kefh: {
            message: {
                br: [
                    "tia",
                    "tio"
                ]
            },
            examples: null,
            variants: null
        },
        kerk: {
            message: {
                br: [
                    "desatualização"
                ]
            },
            examples: null,
            variants: null
        },
        kina: {
            message: {
                br: [
                    "vegetal"
                ]
            },
            examples: null,
            variants: null
        },
        kini: {
            message: {
                br: [
                    "episódio",
                    "caso"
                ]
            },
            examples: null,
            variants: null
        },
        kjor: {
            message: {
                br: [
                    "personalidade",
                    "pessoa",
                    "senhor",
                    "senhoria"
                ]
            },
            examples: null,
            variants: null
        },
        klai: {
            message: {
                br: [
                    "código",
                    "senha",
                    "palavra-chave",
                    "chave"
                ]
            },
            examples: null,
            variants: null
        },
        klan: {
            message: {
                br: [
                    "grupo",
                    "time"
                ]
            },
            examples: null,
            variants: null
        },
        klet: {
            message: {
                br: [
                    "barriga"
                ]
            },
            examples: null,
            variants: null
        },
        klin: {
            message: {
                br: [
                    "até",
                    "tchau"
                ]
            },
            examples: null,
            variants: null
        },
        knap: {
            message: {
                br: [
                    "perfeito",
                    "detalhado",
                    "perfeccionista"
                ]
            },
            examples: null,
            variants: null
        },
        knep: {
            message: {
                br: [
                    "certo",
                    "correto",
                    "verdade",
                    "verdadeiro",
                    "real",
                    "realidade"
                ]
            },
            examples: null,
            variants: null
        },
        knet: {
            message: {
                br: [
                    "série"
                ]
            },
            examples: null,
            variants: null
        },
        knyh: {
            message: {
                br: [
                    "briga",
                    "luta"
                ]
            },
            examples: null,
            variants: null
        },
        kral: {
            message: {
                br: [
                    "livre",
                    "liberto",
                    "descontrolado"
                ]
            },
            examples: null,
            variants: null
        },
        krat: {
            message: {
                br: [
                    "problema"
                ]
            },
            examples: null,
            variants: null
        },
        krfi: {
            message: {
                br: [
                    "favor"
                ]
            },
            examples: null,
            variants: null
        },
        krka: {
            message: {
                br: [
                    "preso"
                ]
            },
            examples: null,
            variants: null
        },
        kruk: {
            message: {
                br: [
                    "tradução"
                ]
            },
            examples: null,
            variants: null
        },
        ktra: {
            message: {
                br: [
                    "entre"
                ]
            },
            examples: null,
            variants: null
        },
        ktuh: {
            message: {
                br: [
                    "atenção"
                ]
            },
            examples: null,
            variants: null
        },
        kuil: {
            message: {
                br: [
                    "saúde"
                ]
            },
            examples: null,
            variants: null
        },
        kuky: {
            message: {
                br: [
                    "céu"
                ]
            },
            examples: null,
            variants: null
        },
        kulh: {
            message: {
                br: [
                    "máquina"
                ]
            },
            examples: null,
            variants: null
        },
        kurp: {
            message: {
                br: [
                    "inútil"
                ]
            },
            examples: null,
            variants: null
        },
        kwyh: {
            message: {
                br: [
                    "espaço (não muito grande)",
                    "quarto"
                ]
            },
            examples: null,
            variants: null
        },
        kyek: {
            message: {
                br: [
                    "mendigo"
                ]
            },
            examples: null,
            variants: null
        },
        kyia: {
            message: {
                br: [
                    "oi",
                    "olá"
                ]
            },
            examples: null,
            variants: null
        },
        kyna: {
            message: {
                br: [
                    "porra"
                ]
            },
            examples: null,
            variants: null
        },
        lala: {
            message: {
                br: [
                    "gelo",
                    "gelado",
                    "sorvete",
                    "picolé"
                ]
            },
            examples: null,
            variants: null
        },
        larb: {
            message: {
                br: [
                    "trabalhador"
                ]
            },
            examples: null,
            variants: null
        },
        lara: {
            message: {
                br: [
                    "fruta"
                ]
            },
            examples: null,
            variants: null
        },
        lare: {
            message: {
                br: [
                    "alguém"
                ]
            },
            examples: null,
            variants: null
        },
        lari: {
            message: {
                br: [
                    "algum",
                    "alguma"
                ]
            },
            examples: null,
            variants: null
        },
        lark: {
            message: {
                br: [
                    "ocupado"
                ]
            },
            examples: null,
            variants: null
        },
        layw: {
            message: {
                br: [
                    "tapete",
                    "carpete",
                    "piso",
                    "forro",
                ]
            },
            examples: null,
            variants: null
        },
        lhun: {
            message: {
                br: [
                    "pulso"
                ]
            },
            examples: null,
            variants: null
        },
        lide: {
            message: {
                br: [
                    "ímã"
                ]
            },
            examples: null,
            variants: null
        },
        lifu: {
            message: {
                br: [
                    "decepcionado",
                    "desmotivado"
                ]
            },
            examples: null,
            variants: null
        },
        liit: {
            message: {
                br: [
                    "frio",
                    "inverno"
                ]
            },
            examples: null,
            variants: null
        },
        liku: {
            message: {
                br: [
                    "antigo",
                    "relíquia",
                    "histórico",
                    "outrora"
                ]
            },
            examples: null,
            variants: null
        },
        lili: {
            message: {
                br: [
                    "riso"
                ]
            },
            examples: null,
            variants: null
        },
        lily: {
            message: {
                br: [
                    "sorriso"
                ]
            },
            examples: null,
            variants: null
        },
        limy: {
            message: {
                br: [
                    "biscoito",
                    "bolacha"
                ]
            },
            examples: null,
            variants: null
        },
        lint: {
            message: {
                br: [
                    "língua"
                ]
            },
            examples: null,
            variants: null
        },
        liuf: {
            message: {
                br: [
                    "mal",
                    "mau",
                    "triste"
                ]
            },
            examples: null,
            variants: null
        },
        liuk: {
            message: {
                br: [
                    "péssimo",
                    "horrível",
                    "terrível"
                ]
            },
            examples: null,
            variants: null
        },
        lofh: {
            message: {
                br: [
                    "padrinho",
                    "madrinha"
                ]
            },
            examples: null,
            variants: null
        },
        lofi: {
            message: {
                br: [
                    "branco"
                ]
            },
            examples: null,
            variants: null
        },
        lohp: {
            message: {
                br: [
                    "trás"
                ]
            },
            examples: null,
            variants: null
        },
        loht: {
            message: {
                br: [
                    "cara",
                    "face",
                    "frente"
                ]
            },
            examples: null,
            variants: null
        },
        lokl: {
            message: {
                br: [
                    "acaso"
                ]
            },
            examples: null,
            variants: null
        },
        lokt: {
            message: {
                br: [
                    "para",
                    "pra"
                ]
            },
            examples: null,
            variants: null
        },
        loku: {
            message: {
                br: [
                    "osso"
                ]
            },
            examples: null,
            variants: null
        },
        lolk: {
            message: {
                br: [
                    "da",
                    "de",
                    "do",
                    "por"
                ]
            },
            examples: null,
            variants: null
        },
        lolo: {
            message: {
                br: [
                    "ovo"
                ]
            },
            examples: null,
            variants: null
        },
        lope: {
            message: {
                br: [
                    "folha",
                    "papel"
                ]
            },
            old_message: {
                br: [
                    "pena",
                    "tela"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "fruf",
                "pote"
            ]
        },
        lopk: {
            message: {
                br: [
                    "deus"
                ]
            },
            examples: null,
            variants: null
        },
        lowe: {
            message: {
                br: [
                    "universidade"
                ]
            },
            examples: null,
            variants: null
        },
        lual: {
            message: {
                br: [
                    "viagem"
                ]
            },
            examples: null,
            variants: null
        },
        luka: {
            message: {
                br: [
                    "perna"
                ]
            },
            examples: null,
            variants: null
        },
        luly: {
            message: {
                br: [
                    "semente"
                ]
            },
            examples: null,
            variants: null
        },
        lumu: {
            message: {
                br: [
                    "caderno",
                    "livro"
                ]
            },
            examples: null,
            variants: null
        },
        lung: {
            message: {
                br: [
                    "ombro"
                ]
            },
            examples: null,
            variants: null
        },
        luph: {
            message: {
                br: [
                    "coxa"
                ]
            },
            examples: null,
            variants: null
        },
        lurd: {
            message: {
                br: [
                    "distante",
                    "longe"
                ]
            },
            examples: null,
            variants: null
        },
        lure: {
            message: {
                br: [
                    "gênio",
                    "inteligente"
                ]
            },
            examples: null,
            variants: null
        },
        luyo: {
            message: {
                br: [
                    "dragão"
                ]
            },
            examples: null,
            variants: null
        },
        lyka: {
            message: {
                br: [
                    "reino"
                ]
            },
            examples: null,
            variants: null
        },
        lyru: {
            message: {
                br: [
                    "feio"
                ]
            },
            examples: null,
            variants: null
        },
        lyvo: {
            message: {
                br: [
                    "mesquinho",
                    "fútil"
                ]
            },
            examples: null,
            variants: null
        },
        maly: {
            message: {
                br: [
                    "redação",
                    "texto"
                ]
            },
            examples: null,
            variants: null
        },
        maah: {
            message: {
                br: [
                    "sim",
                    "claro"
                ]
            },
            examples: null,
            variants: null
        },
        maeh: {
            message: {
                br: [
                    "certeza "
                ]
            },
            examples: null,
            variants: null
        },
        mana: {
            message: {
                br: [
                    "não",
                    "incerto"
                ]
            },
            examples: null,
            variants: null
        },
        mank: {
            message: {
                br: [
                    "contrário",
                    "inverso",
                    "des-",
                    "a-"
                ]
            },
            examples: null,
            variants: null
        },
        maol: {
            message: {
                br: [
                    "então",
                    "portanto"
                ]
            },
            examples: null,
            variants: null
        },
        medy: {
            message: {
                br: [
                    "medicina",
                    "médico"
                ]
            },
            examples: null,
            variants: null
        },
        mhat: {
            message: {
                br: [
                    "matemática"
                ]
            },
            examples: null,
            variants: null
        },
        mhut: {
            message: {
                br: [
                    "constante",
                    "estável"
                ]
            },
            examples: null,
            variants: null
        },
        molg: {
            message: {
                br: [
                    "macarrão"
                ]
            },
            examples: null,
            variants: null
        },
        molh: {
            message: {
                br: [
                    "boi",
                    "vaca"
                ]
            },
            examples: null,
            variants: null
        },
        muka: {
            message: {
                br: [
                    "decimal",
                    "(indicador de referência de valor depois da vírgula, verifique exemplos)",
                ]
            },
            examples: [
                {
                    phrase: "ohde muka ohde",
                    message: {
                        br: [
                            "1.1",
                            "um vírgula um",
                            "um 'ponto' um"
                        ]
                    }
                },
                {
                    phrase: "muka qute mula troe qute",
                    message: {
                        br: [
                            "0.40004",
                            "zero vírgula quarenta mil e quatro",
                            "quatro 'zeros vezes' três quatro"
                        ]
                    }
                }
            ],
            variants: null
        },
        mula: {
            message: {
                br: [
                    "multiplicador",
                    "(indicador de potência de 10, verifique exemplos)"
                ]
            },
            examples: [
                {
                    phrase: "ohde mula ohde",
                    message: {
                        br: [
                            "10",
                            "dez",
                            "um 'zeros vezes' um"
                        ]
                    }
                },
                {
                    phrase: "qute troe mula troe ohde muka ohde uhso ohde",
                    message: {
                        br: [
                            "430001.101",
                            "quatrocentos e trinta mil e um vírgula um zero um",
                            "quatro três 'zeros vezes' três um 'ponto' um zero um"
                        ]
                    }
                },
            ],
            variants: null
        },
        muna: {
            message: {
                br: [
                    "ou"
                ]
            },
            old_message: {
                br: [
                    "entretanto"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "sari"
            ]
        },
        munu: {
            message: {
                br: [
                    "lição",
                    "tarefa"
                ]
            },
            examples: null,
            variants: null
        },
        nagt: {
            message: {
                br: [
                    "estresse"
                ]
            },
            examples: null,
            variants: null
        },
        nape: {
            message: {
                br: [
                    "apenas"
                ]
            },
            old_message: {
                br: [
                    "só"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nofy"
            ]
        },
        naqi: {
            message: {
                br: [
                    "escolha",
                    "opção",
                    "configuração"
                ]
            },
            examples: null,
            variants: null
        },
        nheh: {
            message: {
                br: [
                    "igreja"
                ]
            },
            examples: null,
            variants: null
        },
        nhoe: {
            message: {
                br: [
                    "nove"
                ]
            },
            examples: null,
            variants: null
        },
        nhum: {
            message: {
                br: [
                    "sorte"
                ]
            },
            examples: null,
            variants: null
        },
        nili: {
            message: {
                br: [
                    "frase "
                ]
            },
            examples: null,
            variants: null
        },
        njvn: {
            message: {
                br: [
                    "alho"
                ]
            },
            examples: null,
            variants: null
        },
        noag: {
            message: {
                br: [
                    "batata"
                ]
            },
            examples: null,
            variants: null
        },
        nofy: {
            message: {
                br: [
                    "sozinho",
                    "só",
                    "solirário",
                    "singular",
                    "único"
                ]
            },
            examples: null,
            variants: null
        },
        nolc: {
            message: {
                br: [
                    "anti",
                    "sem"
                ]
            },
            examples: null,
            variants: null
        },
        nuki: {
            message: {
                br: [
                    "coitado"
                ]
            },
            examples: null,
            variants: null
        },
        nukn: {
            message: {
                br: [
                    "colaboração"
                ]
            },
            examples: null,
            variants: null
        },
        nune: {
            message: {
                br: [
                    "fluente"
                ]
            },
            examples: null,
            variants: null
        },
        nury: {
            message: {
                br: [
                    "permanente",
                    "para sempre"
                ]
            },
            examples: null,
            variants: null
        },
        nyht: {
            message: {
                br: [
                    "essa",
                    "esse",
                    "esta",
                    "este"
                ]
            },
            examples: null,
            variants: null
        },
        nyil: {
            message: {
                br: [
                    "pior"
                ]
            },
            examples: null,
            variants: null
        },
        nyta: {
            message: {
                br: [
                    "química",
                    "químico"
                ]
            },
            examples: null,
            variants: null
        },
        oaut: {
            message: {
                br: [
                    "espelho"
                ]
            },
            examples: null,
            variants: null
        },
        ohde: {
            message: {
                br: [
                    "um",
                    "uma"
                ]
            },
            examples: null,
            variants: null
        },
        ohte: {
            message: {
                br: [
                    "oito"
                ]
            },
            examples: null,
            variants: null
        },
        olal: {
            message: {
                br: [
                    "a",
                    "ao",
                    "o",
                    "à",
                    "as",
                    "aos",
                    "os",
                    "às"
                ]
            },
            examples: null,
            variants: null
        },
        olar: {
            message: {
                br: [
                    "fórmula",
                    "receita",
                    "dicionário"
                ]
            },
            examples: null,
            variants: null
        },
        oloj: {
            message: {
                br: [
                    "menor",
                    "menos",
                    "pequeno",
                    "pouco"
                ]
            },
            examples: null,
            variants: null
        },
        otsi: {
            message: {
                br: [
                    "carnívoro"
                ]
            },
            examples: null,
            variants: null
        },
        otun: {
            message: {
                br: [
                    "música",
                    "músico"
                ]
            },
            examples: null,
            variants: null
        },
        ougt: {
            message: {
                br: [
                    "olho"
                ]
            },
            examples: null,
            variants: null
        },
        oyye: {
            message: {
                br: [
                    "loiro"
                ]
            },
            examples: null,
            variants: null
        },
        ozuk: {
            message: {
                br: [
                    "onda"
                ]
            },
            examples: null,
            variants: null
        },
        pane: {
            message: {
                br: [
                    "próton"
                ]
            },
            examples: null,
            variants: null
        },
        pate: {
            message: {
                br: [
                    "planta",
                    "árvore"
                ]
            },
            examples: null,
            variants: null
        },
        paut: {
            message: {
                br: [
                    "caralho"
                ]
            },
            examples: null,
            variants: null
        },
        pedt: {
            message: {
                br: [
                    "antes",
                    "último"
                ]
            },
            examples: null,
            variants: null
        },
        penk: {
            message: {
                br: [
                    "anormal",
                    "errado",
                    "erro",
                    "falha",
                    "falso",
                    "virtual",
                    "emulado",
                    "mentira"
                ]
            },
            examples: null,
            variants: null
        },
        phaf: {
            message: {
                br: [
                    "farmacêutico",
                    "farmácia"
                ]
            },
            examples: null,
            variants: null
        },
        phed: {
            message: {
                br: [
                    "foto",
                    "imagem"
                ]
            },
            examples: null,
            variants: null
        },
        phlo: {
            message: {
                br: [
                    "alto"
                ]
            },
            examples: null,
            variants: null
        },
        phoa: {
            message: {
                br: [
                    "fone"
                ]
            },
            examples: null,
            variants: null
        },
        phor: {
            message: {
                br: [
                    "português"
                ]
            },
            examples: null,
            variants: null
        },
        phuf: {
            message: {
                br: [
                    "cotovelada"
                ]
            },
            examples: null,
            variants: null
        },
        phus: {
            message: {
                br: [
                    "física"
                ]
            },
            examples: null,
            variants: null
        },
        pitn: {
            message: {
                br: [
                    "nariz"
                ]
            },
            examples: null,
            variants: null
        },
        pikt: {
            message: {
                br: [
                    "alicate"
                ]
            },
            examples: null,
            variants: null
        },
        plar: {
            message: {
                br: [
                    "trabalho"
                ]
            },
            examples: null,
            variants: null
        },
        plep: {
            message: {
                br: [
                    "café",
                    "cafeína"
                ]
            },
            examples: null,
            variants: null
        },
        plek: {
            message: {
                br: [
                    "bebida energética",
                    "energético"
                ]
            },
            old_message: {
                br: [
                    "eletricidade",
                    "elétrico"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "trat"
            ]
        },
        plof: {
            message: {
                br: [
                    "responsável"
                ]
            },
            examples: null,
            variants: null
        },
        plug: {
            message: {
                br: [
                    "pulsação"
                ]
            },
            examples: null,
            variants: null
        },
        poad: {
            message: {
                br: [
                    "massa"
                ]
            },
            examples: null,
            variants: null
        },
        poag: {
            message: {
                br: [
                    "manteiga"
                ]
            },
            examples: null,
            variants: null
        },
        podr: {
            message: {
                br: [
                    "capô"
                ]
            },
            examples: null,
            variants: null
        },
        pody: {
            message: {
                br: [
                    "pudim",
                    "pé"
                ]
            },
            examples: null,
            variants: null
        },
        pofh: {
            message: {
                br: [
                    "chute"
                ]
            },
            examples: null,
            variants: null
        },
        poje: {
            message: {
                br: [
                    "padre"
                ]
            },
            examples: null,
            variants: null
        },
        pola: {
            message: {
                br: [
                    "saco"
                ]
            },
            examples: null,
            variants: null
        },
        pole: {
            message: {
                br: [
                    "detalhe",
                    "ponto",
                    "pixel"
                ]
            },
            examples: null,
            variants: null
        },
        polh: {
            message: {
                br: [
                    "joelhada"
                ]
            },
            examples: null,
            variants: null
        },
        polt: {
            message: {
                br: [
                    "lábio"
                ]
            },
            examples: null,
            variants: null
        },
        poly: {
            message: {
                br: [
                    "algo",
                    "coisa",
                    "objeto",
                    "lance",
                    "parada",
                    "rolê",
                    "aposta"
                ]
            },
            old_message: {
                br: [
                    "chute"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "pofh"
            ]
        },
        pope: {
            message: {
                br: [
                    "bebida"
                ]
            },
            examples: null,
            variants: null
        },
        pora: {
            message: {
                br: [
                    "futebol"
                ]
            },
            examples: null,
            variants: null
        },
        pote: {
            message: {
                br: [
                    "tela",
                    "arte",
                    "janela"
                ]
            },
            examples: null,
            variants: null
        },
        potr: {
            message: {
                br: [
                    "penal"
                ]
            },
            examples: null,
            variants: null
        },
        pous: {
            message: {
                br: [
                    "sopa"
                ]
            },
            examples: null,
            variants: null
        },
        praf: {
            message: {
                br: [
                    "pediatra",
                    "pediatria"
                ]
            },
            examples: null,
            variants: null
        },
        pred: {
            message: {
                br: [
                    "som"
                ]
            },
            examples: null,
            variants: null
        },
        proe: {
            message: {
                br: [
                    "adaptador",
                    "conector"
                ]
            },
            examples: null,
            variants: null
        },
        prud: {
            message: {
                br: [
                    "cabo",
                    "fio",
                    "internet",
                    "net",
                    "enrolado",
                    "embaralhado"
                ]
            },
            examples: null,
            variants: null
        },
        ptha: {
            message: {
                br: [
                    "plástico"
                ]
            },
            examples: null,
            variants: null
        },
        ptos: {
            message: {
                br: [
                    "geralmente"
                ]
            },
            examples: null,
            variants: null
        },
        ptuf: {
            message: {
                br: [
                    "roda",
                    "aro"
                ]
            },
            examples: null,
            variants: null
        },
        puag: {
            message: {
                br: [
                    "margarina"
                ]
            },
            examples: null,
            variants: null
        },
        pulh: {
            message: {
                br: [
                    "porco"
                ]
            },
            examples: null,
            variants: null
        },
        pury: {
            message: {
                br: [
                    "estágio",
                    "parcial",
                    "temporário",
                    "estagiário",
                    "estação",
                    "período",
                    "alugado"
                ]
            },
            examples: null,
            variants: null
        },
        qene: {
            message: {
                br: [
                    "quente"
                ]
            },
            examples: null,
            variants: null
        },
        qnad: {
            message: {
                br: [
                    "quando"
                ]
            },
            examples: null,
            variants: null
        },
        qute: {
            message: {
                br: [
                    "quatro"
                ]
            },
            examples: null,
            variants: null
        },
        qwut: {
            message: {
                br: [
                    "malandragem",
                    "malandro"
                ]
            },
            examples: null,
            variants: null
        },
        raki: {
            message: {
                br: [
                    "guerra"
                ]
            },
            examples: null,
            variants: null
        },
        raih: {
            message: {
                br: [
                    "assim"
                ]
            },
            examples: null,
            variants: null
        },
        raik: {
            message: {
                br: [
                    "martelo"
                ]
            },
            examples: null,
            variants: null
        },
        rara: {
            message: {
                br: [
                    "bora",
                    "em boa hora",
                    "em perfeito estado",
                    "ao ponto",
                    "no ponto",
                    "temperado"
                ]
            },
            examples: null,
            variants: null
        },
        rauk: {
            message: {
                br: [
                    "sonho"
                ]
            },
            examples: null,
            variants: null
        },
        raut: {
            message: {
                br: [
                    "mouse",
                    "rato",
                    "peste"
                ]
            },
            examples: null,
            variants: null
        },
        regh: {
            message: {
                br: [
                    "relógio"
                ]
            },
            examples: null,
            variants: null
        },
        reka: {
            message: {
                br: [
                    "aqui"
                ]
            },
            examples: null,
            variants: null
        },
        reko: {
            message: {
                br: [
                    "rumo"
                ]
            },
            examples: null,
            variants: null
        },
        rela: {
            message: {
                br: [
                    "ali"
                ]
            },
            examples: null,
            variants: null
        },
        relo: {
            message: {
                br: [
                    "caminho",
                    "percurso",
                    "pista",
                    "estrada"
                ]
            },
            examples: null,
            variants: null
        },
        relh: {
            message: {
                br: [
                    "avestruz"
                ]
            },
            examples: null,
            variants: null
        },
        rhfa: {
            message: {
                br: [
                    "rádio"
                ]
            },
            examples: null,
            variants: null
        },
        rhis: {
            message: {
                br: [
                    "história"
                ]
            },
            examples: null,
            variants: null
        },
        rifn: {
            message: {
                br: [
                    "cabelo"
                ]
            },
            examples: null,
            variants: null
        },
        ripy: {
            message: {
                br: [
                    "perigo"
                ]
            },
            examples: null,
            variants: null
        },
        rirt: {
            message: {
                br: [
                    "escuro",
                    "escuridão",
                    "noite",
                    "preto"
                ]
            },
            examples: null,
            variants: null
        },
        rote: {
            message: {
                br: [
                    "filme"
                ]
            },
            examples: null,
            variants: null
        },
        roti: {
            message: {
                br: [
                    "remoto"
                ]
            },
            examples: null,
            variants: null
        },
        ruka: {
            message: {
                br: [
                    "barra",
                    "régua"
                ]
            },
            examples: null,
            variants: null
        },
        ruky: {
            message: {
                br: [
                    "alavanca"
                ]
            },
            examples: null,
            variants: null
        },
        rury: {
            message: {
                br: [
                    "tipo"
                ]
            },
            examples: null,
            variants: null
        },
        rutu: {
            message: {
                br: [
                    "desenho"
                ]
            },
            examples: null,
            variants: null
        },
        rwes: {
            message: {
                br: [
                    "porta"
                ]
            },
            examples: null,
            variants: null
        },
        ryke: {
            message: {
                br: [
                    "droga",
                    "porcaria"
                ]
            },
            examples: null,
            variants: null
        },
        ryty: {
            message: {
                br: [
                    "início",
                    "menu"
                ]
            },
            examples: null,
            variants: null
        },
        saan: {
            message: {
                br: [
                    "bolado"
                ]
            },
            examples: null,
            variants: null
        },
        sadu: {
            message: {
                br: [
                    "separado"
                ]
            },
            examples: null,
            variants: null
        },
        saki: {
            message: {
                br: [
                    "paz"
                ]
            },
            examples: null,
            variants: null
        },
        salu: {
            message: {
                br: [
                    "cursinho",
                    "curso"
                ]
            },
            examples: null,
            variants: null
        },
        saqi: {
            message: {
                br: [
                    "idade"
                ]
            },
            examples: null,
            variants: null
        },
        sari: {
            message: {
                br: [
                    "mas",
                    "porém",
                    "entretanto",
                    "todavia"
                ]
            },
            examples: null,
            variants: null
        },
        sase: {
            message: {
                br: [
                    "total"
                ]
            },
            examples: null,
            variants: null
        },
        sele: {
            message: {
                br: [
                    "nem"
                ]
            },
            examples: null,
            variants: null
        },
        shie: {
            message: {
                br: [
                    "ciências"
                ]
            },
            examples: null,
            variants: null
        },
        skaa: {
            message: {
                br: [
                    "janeiro"
                ]
            },
            examples: null,
            variants: null
        },
        skab: {
            message: {
                br: [
                    "fevereiro"
                ]
            },
            examples: null,
            variants: null
        },
        skac: {
            message: {
                br: [
                    "março"
                ]
            },
            examples: null,
            variants: null
        },
        skad: {
            message: {
                br: [
                    "abril"
                ]
            },
            examples: null,
            variants: null
        },
        skae: {
            message: {
                br: [
                    "maio"
                ]
            },
            examples: null,
            variants: null
        },
        skaf: {
            message: {
                br: [
                    "junho"
                ]
            },
            examples: null,
            variants: null
        },
        skag: {
            message: {
                br: [
                    "julho"
                ]
            },
            examples: null,
            variants: null
        },
        skah: {
            message: {
                br: [
                    "agosto"
                ]
            },
            examples: null,
            variants: null
        },
        skai: {
            message: {
                br: [
                    "setembro"
                ]
            },
            examples: null,
            variants: null
        },
        skaj: {
            message: {
                br: [
                    "outubro"
                ]
            },
            examples: null,
            variants: null
        },
        skak: {
            message: {
                br: [
                    "novembro"
                ]
            },
            examples: null,
            variants: null
        },
        skal: {
            message: {
                br: [
                    "dezembro"
                ]
            },
            examples: null,
            variants: null
        },
        skra: {
            message: {
                br: [
                    "imbecil"
                ]
            },
            examples: null,
            variants: null
        },
        slag: {
            message: {
                br: [
                    "salgado"
                ]
            },
            examples: null,
            variants: null
        },
        sleg: {
            message: {
                br: [
                    "cera"
                ]
            },
            examples: null,
            variants: null
        },
        smug: {
            message: {
                br: [
                    "cigarro"
                ]
            },
            examples: null,
            variants: null
        },
        snag: {
            message: {
                br: [
                    "bicicleta",
                    "bike",
                    "ciclista",
                    "ciclismo"                    
                ]
            },
            examples: null,
            variants: null
        },
        snop: {
            message: {
                br: [
                    "jamais",
                    "nunca"
                ]
            },
            examples: null,
            variants: null
        },
        snuz: {
            message: {
                br: [
                    "cama"
                ]
            },
            examples: null,
            variants: null
        },
        sofy: {
            message: {
                br: [
                    "filosofia",
                    "filósofo"
                ]
            },
            examples: null,
            variants: null
        },
        spet: {
            message: {
                br: [
                    "sombra"
                ]
            },
            examples: null,
            variants: null
        },
        spot: {
            message: {
                br: [
                    "sempre"
                ]
            },
            examples: null,
            variants: null
        },
        srag: {
            message: {
                br: [
                    "frango"
                ]
            },
            examples: null,
            variants: null
        },
        srak: {
            message: {
                br: [
                    "dada"
                ]
            },
            examples: null,
            variants: null
        },
        sret: {
            message: {
                br: [
                    "faxina"
                ]
            },
            examples: null,
            variants: null
        },
        stor: {
            message: {
                br: [
                    "host"
                ]
            },
            examples: null,
            variants: null
        },
        sufe: {
            message: {
                br: [
                    "sete"
                ]
            },
            examples: null,
            variants: null
        },
        suff: {
            message: {
                br: [
                    "novo",
                    "novamente",
                    "de novo"
                ]
            },
            examples: null,
            variants: null
        },
        suft: {
            message: {
                br: [
                    "suco"
                ]
            },
            examples: null,
            variants: null
        },
        sufy: {
            message: {
                br: [
                    "infernal",
                    "inferno",
                    "diabo"
                ]
            },
            examples: null,
            variants: null
        },
        sulu: {
            message: {
                br: [
                    "diferente"
                ]
            },
            examples: null,
            variants: null
        },
        sute: {
            message: {
                br: [
                    "seis"
                ]
            },
            examples: null,
            variants: null
        },
        swag: {
            message: {
                br: [
                    "servidor"
                ]
            },
            examples: null,
            variants: null
        },
        swap: {
            message: {
                br: [
                    "versão"
                ]
            },
            old_message: {
                br: [
                    "agora"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "grah"
            ]
        },
        swak: {
            message: {
                br: [
                    "verdura",
                    "vegetal",
                    "vegetação",
                    "planta"
                ]
            },
            examples: null,
            variants: null
        },
        swen: {
            message: {
                br: [
                    "preguiçoso"
                ]
            },
            examples: null,
            variants: null
        },
        swyn: {
            message: {
                br: [
                    "forma"
                ]
            },
            examples: null,
            variants: null
        },
        tahi: {
            message: {
                br: [
                    "resposta",
                    "solução"
                ]
            },
            examples: null,
            variants: null
        },
        tart: {
            message: {
                br: [
                    "estalactite"
                ]
            },
            examples: null,
            variants: null
        },
        taek: {
            message: {
                br: [
                    "estado"
                ]
            },
            examples: null,
            variants: null
        },
        tdod: {
            message: {
                br: [
                    "tomate"
                ]
            },
            examples: null,
            variants: null
        },
        teak: {
            message: {
                br: [
                    "rico",
                    "riqueza"
                ]
            },
            examples: null,
            variants: null
        },
        tofh: {
            message: {
                br: [
                    "irmão",
                    "irmã"
                ]
            },
            examples: null,
            variants: null
        },
        tohd: {
            message: {
                br: [
                    "todo",
                    "tudo",
                    "toda",
                    "cada"
                ]
            },
            examples: null,
            variants: null
        },
        tops: {
            message: {
                br: [
                    "vez"
                ]
            },
            examples: null,
            variants: null
        },
        topt: {
            message: {
                br: [
                    "divertido",
                    "legal"
                ]
            },
            examples: null,
            variants: null
        },
        topk: {
            message: {
                br: [
                    "chata",
                    "chato"
                ]
            },
            examples: null,
            variants: null
        },
        tort: {
            message: {
                br: [
                    "hoje"
                ]
            },
            examples: null,
            variants: null
        },
        totr: {
            message: {
                br: [
                    "amanhã",
                    "manhã"
                ]
            },
            examples: null,
            variants: null
        },
        tpos: {
            message: {
                br: [
                    "raramente"
                ]
            },
            examples: null,
            variants: null
        },
        trar: {
            message: {
                br: [
                    "estalagmite"
                ]
            },
            examples: null,
            variants: null
        },
        trat: {
            message: {
                br: [
                    "eletricidade",
                    "elétrico"
                ]
            },
            examples: null,
            variants: null
        },
        trie: {
            message: {
                br: [
                    "século"
                ]
            },
            examples: null,
            variants: null
        },
        trir: {
            message: {
                br: [
                    "dia"
                ]
            },
            examples: null,
            variants: null
        },
        troa: {
            message: {
                br: [
                    "morno"
                ]
            },
            examples: null,
            variants: null
        },
        troe: {
            message: {
                br: [
                    "três"
                ]
            },
            examples: null,
            variants: null
        },
        trot: {
            message: {
                br: [
                    "ontem"
                ]
            },
            examples: null,
            variants: null
        },
        trta: {
            message: {
                br: [
                    "dentro",
                    "em",
                    "na",
                    "no",
                    "que",
                    "se"
                ]
            },
            examples: null,
            variants: null
        },
        true: {
            message: {
                br: [
                    "forte"
                ]
            },
            examples: null,
            variants: null
        },
        trui: {
            message: {
                br: [
                    "computador"
                ]
            },
            examples: null,
            variants: null
        },
        trur: {
            message: {
                br: [
                    "lado"
                ]
            },
            examples: null,
            variants: null
        },
        trus: {
            message: {
                br: [
                    "vidro",
                    "copo",
                    "balde",
                    "reservatório",
                    "bacia"
                ]
            },
            examples: null,
            variants: null
        },
        trut: {
            message: {
                br: [
                    "esquerda",
                    "esquerdo"
                ]
            },
            examples: null,
            variants: null
        },
        turt: {
            message: {
                br: [
                    "direita",
                    "direito"
                ]
            },
            examples: null,
            variants: null
        },
        tute: {
            message: {
                br: [
                    "cérebro"
                ]
            },
            examples: null,
            variants: null
        },
        tuti: {
            message: {
                br: [
                    "amigo"
                ]
            },
            examples: null,
            variants: null
        },
        tyrr: {
            message: {
                br: [
                    "hora",
                    "momento"
                ]
            },
            examples: null,
            variants: null
        },
        uadu: {
            message: {
                br: [
                    "junto",
                    "unido"
                ]
            },
            examples: null,
            variants: null
        },
        uhfu: {
            message: {
                br: [
                    "joelho"
                ]
            },
            examples: null,
            variants: null
        },
        uhle: {
            message: {
                br: [
                    "apoio (moral ou material)",
                    "suporte"
                ]
            },
            examples: null,
            variants: null
        },
        uhly: {
            message: {
                br: [
                    "mesa"
                ]
            },
            examples: null,
            variants: null
        },
        uhno: {
            message: {
                br: [
                    "estômago"
                ]
            },
            examples: null,
            variants: null
        },
        uhpe: {
            message: {
                br: [
                    "baleia"
                ]
            },
            examples: null,
            variants: null
        },
        uhso: {
            message: {
                br: [
                    "zero"
                ]
            },
            examples: null,
            variants: null
        },
        uhtr: {
            message: {
                br: [
                    "clima",
                    "tempo"
                ]
            },
            old_message: {
                br: [
                    "relógio"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "regh"
            ]
        },
        uise: {
            message: {
                br: [
                    "fácil"
                ]
            },
            examples: null,
            variants: null
        },
        ulus: {
            message: {
                br: [
                    "igual"
                ]
            },
            examples: null,
            variants: null
        },
        unmu: {
            message: {
                br: [
                    "mão"
                ]
            },
            examples: null,
            variants: null
        },
        uolo: {
            message: {
                br: [
                    "arroz"
                ]
            },
            examples: null,
            variants: null
        },
        urno: {
            message: {
                br: [
                    "intestino"
                ]
            },
            examples: null,
            variants: null
        },
        uviu: {
            message: {
                br: [
                    "peixe"
                ]
            },
            examples: null,
            variants: null
        },
        varu: {
            message: {
                br: [
                    "lobo"
                ]
            },
            examples: null,
            variants: null
        },
        valk: {
            message: {
                br: [
                    "queijo"
                ]
            },
            examples: null,
            variants: null
        },
        vest: {
            message: {
                br: [
                    "leite "
                ]
            },
            examples: null,
            variants: null
        },
        waag: {
            message: {
                br: [
                    "louça"
                ]
            },
            examples: null,
            variants: null
        },
        waki: {
            message: {
                br: [
                    "adolescente",
                    "jovem"
                ]
            },
            examples: null,
            variants: null
        },
        wala: {
            message: {
                br: [
                    "palavra"
                ]
            },
            examples: null,
            variants: null
        },
        wany: {
            message: {
                br: [
                    "criança"
                ]
            },
            examples: null,
            variants: null
        },
        warq: {
            message: {
                br: [
                    "dedo"
                ]
            },
            examples: null,
            variants: null
        },
        witi: {
            message: {
                br: [
                    "sério",
                    "sinceramente",
                    "carinhosamente"
                ]
            },
            examples: null,
            variants: null
        },
        woka: {
            message: {
                br: [
                    "outro"
                ]
            },
            examples: null,
            variants: null
        },
        wuag: {
            message: {
                br: [
                    "aula"
                ]
            },
            examples: null,
            variants: null
        },
        wuha: {
            message: {
                br: [
                    "vampiro",
                    "máquina relacionada a sangue",
                    "sangue"
                ]
            },
            examples: null,
            variants: null
        },
        wuhp: {
            message: {
                br: [
                    "super"
                ]
            },
            examples: null,
            variants: null
        },
        wuje: {
            message: {
                br: [
                    "quem"
                ]
            },
            examples: null,
            variants: null
        },
        wuky: {
            message: {
                br: [
                    "adolescência"
                ]
            },
            examples: null,
            variants: null
        },
        wune: {
            message: {
                br: [
                    "onde"
                ]
            },
            examples: null,
            variants: null
        },
        wuni: {
            message: {
                br: [
                    "infância"
                ]
            },
            examples: null,
            variants: null
        },
        wupe: {
            message: {
                br: [
                    "qual"
                ]
            },
            examples: null,
            variants: null
        },
        wuqa: {
            message: {
                br: [
                    "pergunta"
                ]
            },
            examples: null,
            variants: null
        },
        wuqe: {
            message: {
                br: [
                    "aleatório",
                    "qualquer"
                ]
            },
            examples: null,
            variants: null
        },
        wush: {
            message: {
                br: [
                    "academia"
                ]
            },
            examples: null,
            variants: null
        },
        wusu: {
            message: {
                br: [
                    "relação"
                ]
            },
            examples: null,
            variants: null
        },
        wuyh: {
            message: {
                br: [
                    "extremo",
                    "intensivo"
                ]
            },
            examples: null,
            variants: null
        },
        yair: {
            message: {
                br: [
                    "família"
                ]
            },
            examples: null,
            variants: null
        },
        yaye: {
            message: {
                br: [
                    "água "
                ]
            },
            examples: null,
            variants: null
        },
        yayu: {
            message: {
                br: [
                    "vida"
                ]
            },
            examples: null,
            variants: null
        },
        yela: {
            message: {
                br: [
                    "laranja"
                ]
            },
            examples: null,
            variants: null
        },
        yelo: {
            message: {
                br: [
                    "marrom"
                ]
            },
            examples: null,
            variants: null
        },
        yemo: {
            message: {
                br: [
                    "memória"
                ]
            },
            examples: null,
            variants: null
        },
        yepo: {
            message: {
                br: [
                    "verde"
                ]
            },
            examples: null,
            variants: null
        },
        yeur: {
            message: {
                br: [
                    "inscrito"
                ]
            },
            examples: null,
            variants: null
        },
        yhrn: {
            message: {
                br: [
                    "e",
                    "também",
                    "inclusive"
                ]
            },
            examples: null,
            variants: null
        },
        yloy: {
            message: {
                br: [
                    "cenoura"
                ]
            },
            examples: null,
            variants: null
        },
        yuoa: {
            message: {
                br: [
                    "lua",
                    "ferrugem",
                    "desgastado",
                    "torrado"
                ]
            },
            examples: null,
            variants: null
        },
        ymer: {
            message: {
                br: [
                    "vídeo"
                ]
            },
            examples: null,
            variants: null
        },
        yohu: {
            message: {
                br: [
                    "baú",
                    "caixa"
                ]
            },
            examples: null,
            variants: null
        },
        yoio: {
            message: {
                br: [
                    "roxo"
                ]
            },
            examples: null,
            variants: null
        },
        yoiu: {
            message: {
                br: [
                    "vermelho"
                ]
            },
            examples: null,
            variants: null
        },
        yolo: {
            message: {
                br: [
                    "azul"
                ]
            },
            examples: null,
            variants: null
        },
        yomu: {
            message: {
                br: [
                    "cartão"
                ]
            },
            examples: null,
            variants: null
        },
        yopo: {
            message: {
                br: [
                    "turquesa"
                ]
            },
            examples: null,
            variants: null
        },
        yopu: {
            message: {
                br: [
                    "dourado"
                ]
            },
            examples: null,
            variants: null
        },
        youn: {
            message: {
                br: [
                    "vina",
                    "linguiça",
                    "salsicha"
                ]
            },
            examples: null,
            variants: null
        },
        youo: {
            message: {
                br: [
                    "bege"
                ]
            },
            examples: null,
            variants: null
        },
        youp: {
            message: {
                br: [
                    "prata"
                ]
            },
            examples: null,
            variants: null
        },
        yout: {
            message: {
                br: [
                    "jeito"
                ]
            },
            examples: null,
            variants: null
        },
        yoyo: {
            message: {
                br: [
                    "aparelho"
                ]
            },
            examples: null,
            variants: null
        },
        yoyu: {
            message: {
                br: [
                    "celular",
                    "telefone"
                ]
            },
            examples: null,
            variants: null
        },
        yrui: {
            message: {
                br: [
                    "sono"
                ]
            },
            examples: null,
            variants: null
        },
        yryr: {
            message: {
                br: [
                    "alienígena",
                    "invasor"
                ]
            },
            examples: null,
            variants: null
        },
        ytre: {
            message: {
                br: [
                    "bissexto"
                ]
            },
            examples: null,
            variants: null
        },
        ytyr: {
            message: {
                br: [
                    "fim"
                ]
            },
            examples: null,
            variants: null
        },
        yuiu: {
            message: {
                br: [
                    "amarelo"
                ]
            },
            examples: null,
            variants: null
        },
        yumu: {
            message: {
                br: [
                    "tecido",
                    "têxtil",
                    "textura"
                ]
            },
            examples: null,
            variants: null
        },
        yuno: {
            message: {
                br: [
                    "braço"
                ]
            },
            examples: null,
            variants: null
        },
        yupo: {
            message: {
                br: [
                    "moreno"
                ]
            },
            examples: null,
            variants: null
        },
        yuuh: {
            message: {
                br: [
                    "cinza"
                ]
            },
            examples: null,
            variants: null
        },
        zuyh: {
            message: {
                br: [
                    "sentido"
                ]
            },
            examples: null,
            variants: null
        },
        zold: {
            message: {
                br: [
                    "velocidade",
                    "velocímetro"
                ]
            },
            examples: null,
            variants: null
        },
        yort: {
            message: {
                br: [
                    "rosa"
                ]
            },
            examples: null,
            variants: null
        },
        yopy: {
            message: {
                br: [
                    "foca"
                ]
            },
            examples: null,
            variants: null
        },






        wue: {
            obsolete: true,
            old_message: {
                br: [
                    "amassar",
                    "amocar"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "koy"
            ]
        },
        dea: {
            obsolete: true,
            old_message: {
                br: [
                    "achar"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "dec"
            ]
        },
        grye: {
            obsolete: true,
            old_message: {
                br: [
                    "medo",
                    "susto",
                    "assustador",
                    "medonho",
                    "aterrorizante",
                    "amedrontador",
                    "amedrontado",
                    "assustado"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "gkuku"
            ]
        },
        nilt: {
            obsolete: true,
            old_message: {
                br: [
                    "banho"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "byhku"
            ]
        },
        uyok: {
            obsolete: true,
            old_message: {
                br: [
                    "amor"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "uyoku"
            ]
        },
        pohl: {
            obsolete: true,
            old_message: {
                br: [
                    "frente"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "loht"
            ]
        },
        krum: {
            obsolete: true,
            old_message: {
                br: [
                    "homem",
                    "macho"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nakjor"
            ]
        },
        murk: {
            obsolete: true,
            old_message: {
                br: [
                    "garota",
                    "mulher"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nikjor"
            ]
        },
        warf: {
            obsolete: true,
            old_message: {
                br: [
                    "menina"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "niwany"
            ]
        },
        fraw: {
            obsolete: true,
            old_message: {
                br: [
                    "menino"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nawany"
            ]
        },
        tefh: {
            obsolete: true,
            old_message: {
                br: [
                    "irmã"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nitofh"
            ]
        },
        walu: {
            obsolete: true,
            old_message: {
                br: [
                    "aquilo"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "wa"
            ]
        },
        egua: {
            obsolete: true,
            old_message: {
                br: [
                    "ave",
                    "pássaro",
                    "algo que voe",
                    "avião",
                    "águia"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "egka"
            ]
        },
        eigi: {
            obsolete: true,
            old_message: {
                br: [
                    "ave",
                    "pássaro",
                    "algo que voe",
                    "avião",
                    "águia"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "egka"
            ]
        },
        gofh: {
            obsolete: true,
            old_message: {
                br: [
                    "pai"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nagefh"
            ]
        },
        ifol: {
            obsolete: true,
            old_message: {
                br: [
                    "preto"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "rirt"
            ]
        },
        lefh: {
            obsolete: true,
            old_message: {
                br: [
                    "madrinha"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "nilofh"
            ]
        },
        lohk: {
            obsolete: true,
            old_message: {
                br: [
                    "deus"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "lopk"
            ]
        },
        yauh: {
            obsolete: true,
            old_message: {
                br: [
                    "escuridão",
                    "escuro"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "rirt"
            ]
        },
        liyn: {
            obsolete: true,
            old_message: {
                br: [
                    "vários",
                    "bastante",
                    "maior"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "jolo"
            ]
        },
        slep: {
            obsolete: true,
            old_message: {
                br: [
                    "certo",
                    "correto",
                    "real",
                    "realidade"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "knep"
            ]
        },
        fylu: {
            obsolete: true,
            old_message: {
                br: [
                    "que tem interesse de estar perto de semelhantes, do mesmo sexo, ou que se parecem ser do mesmo",
                    "atraído por membros do mesmo sexo",
                    "homossexual",
                    "gay"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "fraq"
            ]
        },
        grafaw: {
            obsolete: true,
            old_message: {
                br: [
                    "outra",
                    "outro"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "woka"
            ]
        },
        se: {
            obsolete: true,
            old_message: {
                br: [
                    "tu"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "ae"
            ]
        },
        es: {
            obsolete: true,
            old_message: {
                br: [
                    "teu",
                    "tua"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "ea"
            ]
        },
        stop: {
            obsolete: true,
            old_message: {
                br: [
                    "nunca"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "snop"
            ]
        },
        tdou: {
            obsolete: true,
            old_message: {
                br: [
                    "ou"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "muna"
            ]
        },
        inna: {
            obsolete: true,
            old_message: {
                br: [
                    "um",
                    "uma"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "ohde"
            ]
        },
        gfad: {
            obsolete: true,
            old_message: {
                br: [
                    "prova",
                    "teste",
                    "registro",
                    "memória",
                    "registro de memória",
                    "anotação",
                    "trilha",
                    "pegadas",
                    "traços",
                    "registro de algum acontecimento",
                    "resposta (final)",
                    "fato inquestionável",
                    "a verdade pura"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "eneku",
                "decku",
                "knep",
                "gaqku",
                "adbku",
                "dapku"
            ]
        },
        gyyk: {
            obsolete: true,
            old_message: {
                br: [
                    "ainda"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "graf"
            ]
        },
        giit: {
            obsolete: true,
            old_message: {
                br: [
                    "encontrável",
                    "sobrepondo",
                    "visível",
                    "exposto",
                    "sobrevoando",
                    "voando",
                    "flutuando",
                    "sobre",
                    "por cima",
                    "acima",
                    "por cima de algo",
                    "livre",
                    "liberto",
                    "desprotegido",
                    "descontrolado"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "hycku",
                "decku",
                "japga",
                "feni",
                "buyga",
                "kral",
                "dekla"
            ]
        },




        uhro: {
            obsolete: true,
            old_message: {
                br: [
                    "dez (multiplicador ou singular)"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "mula"
            ]
        },
        utro: {
            obsolete: true,
            old_message: {
                br: [
                    "cem"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "mula"
            ]
        },
        bunt: {
            obsolete: true,
            old_message: {
                br: [
                    "mil",
                    "multiplicador",
                    "fator"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "mula"
            ]
        },
        cunt: {
            obsolete: true,
            old_message: {
                br: [
                    "milhão",
                    "milésimo",
                    "multiplicador"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "mula"
            ]
        },
        cunk: {
            obsolete: true,
            old_message: {
                br: [
                    "milhão",
                    "milésimo",
                    "multiplicador"
                ]
            },
            examples: null,
            variants: null,
            replacements: [
                "mula"
            ]
        }
    }
};

dict._populate();





// FOR EACH OBJECT IN ARR DO FCN(OBJECT)
function _fe(arr, fcn) {
    for(let i = 0; i < arr.length; ++i) {
        if (fcn(arr[i]) === false) return;
    }
}

// first ones have more priority
function _merge_objects() {
    let ret = {};

    for(let i = arguments.length - 1; i >= 0; --i) {
        const ks = Object.keys(arguments[i]);
        for(let j = 0; j < ks.length; ++j) ret[ks[j]] = arguments[i][ks[j]];
    }

    return ret;
}
// first ones have more priority
function _concat_arrays() {
    let ret = {};

    for(let i = arguments.length - 1; i >= 0; --i) {
        for(let j = 0; j < arguments[i].length; ++j) ret[ret.length] = arguments[i][j];
    }

    return ret;
}