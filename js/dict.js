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
        if (!word || typeof word !== "string") return null;
        
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
            });

            _fe(this.suffixes, function(group) 
            {
                if (group.filter_len !== ret.type) return;

                _fe(group.cases, function(each) 
                {
                    const keys = Object.keys(each);

                    _fe(keys, function(one) 
                    {
                        if (ret.base.endsWith(one)) {
                            ret.suffixes[ret.suffixes.length] = each[one]; // like pa: { LANG: .... }
                            ret.base = ret.base.substring(0, ret.base.length - one.length);
                            return false;
                        }
                    });
                });
            });
        }
        ret.success = ret.base.length === ret.type;

        return ret;
    }
};


/*
Structure of words:
WORD: {
    message: {
        LANGUAGE: [
            "MEANINGS_IN_THIS_LANGUAGE",
            ...
        ],
        ...
    },
    examples: [ // MAY HAVE 0 OR MORE
        {
            phrase: "EXAMPLE OF USAGE 1",
            message: {
                LANGUAGE: "TRANSLATED IN THIS LANGUAGE"
            }
        }
    ],
    variants: { // MAY BE NULL IF EMPTY
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
    old_message: {
        LANGUAGE: [
            "MEANINGS_IN_THIS_LANGUAGE",
            ...
        ],
        ...
    },
    old_variants: { // MAY BE NULL IF EMPTY
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
    replacements: [
        "KEYS TO CONSIDER",
        ...
    ]
}
*/

let __tst = null;

const dict = {

    // populate data objects with functions
    _populate: function() {        
        Object.keys(this.data).forEach(k => {
            const self = dict.data[k];

            // Make itself a HTML object
            self["toHTML"] = function() {
                function create_list_of_array(arr, classes_base, id, show) {
                    if (!arr) return null;

                    const div = document.createElement("div");

                    div.classList.add("lsw-dict-list-messages");
                    if (classes_base) div.classList.add(...classes_base);
                    if (id) div.setAttribute("id", id);

                    if (show === false) div.classList.add("lsw-hide");

                    arr.forEach((each, idx) => {
                        const p = document.createElement("p");
                        const span = document.createElement("span");

                        p.innerText = each;
                        p.classList.add("lsw-low_indent");

                        span.innerText = `${idx + 1}. `;
                        span.classList.add("lsw-bold");

                        p.prepend(span);
                        div.appendChild(p);
                    });

                    return div;
                }
                function create_button_enabler(resume, text, target_id_to_toggle_with, disabled, selected) {
                    const el = document.createElement("button");
                    
                    el.classList.add("lsw-btn_default");
                    el.classList.add("bar_selector");

                    if (disabled === true) el.classList.add("disabled");
                    if (selected === true) el.classList.add("selected");

                    el.setAttribute("text", text);
                    el.setAttribute("resumed-text", resume);
                    el.setAttribute("id-target", target_id_to_toggle_with);

                    el.addEventListener("click", function(ev) {
                        const src = ev.target;

                        if (src.classList.contains("disabled")) return;

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

                const message       = create_list_of_array(self.message?.[lang_sel],                                                    null,                       `G-${k}-msg`,   not_obsolete);
                const old_message   = create_list_of_array(self.old_message?.[lang_sel],                                                ["lsw-dict-obsolete"],      `G-${k}-omsg`,  false);
                const variants      = create_list_of_array(Object.values(self.variants || {}).flatMap(e => e.message?.[lang_sel]),      null,                       `G-${k}-var`,   false);
                const old_variants  = create_list_of_array(Object.values(self.old_variants || {}).flatMap(e => e.message?.[lang_sel]),  ["lsw-dict-obsolete"],      `G-${k}-ovar`,  false);
                const replacements  = create_list_of_array(self.replacements,                                                           ["lsw-dict-replacement"],   `G-${k}-repl`,  !not_obsolete);

                // === TITLE === //
                const title_div = document.createElement("div");
                const title_head = document.createElement("h2");

                title_head.innerText = `${k}:`;
                title_head.classList.add("lsw-bold");
                title_head.classList.add("lsw-title");
                title_head.classList.add("lsw-inline");
                if (self.obsolete === true) {
                    title_head.classList.add("lsw-dict-obsolete");
                    title_head.setAttribute("title", "Obsoleto. Verifique por alternativas.");
                }

                title_div.classList.add("lsw-inline");
                title_div.classList.add("lsw-arrowed");
                title_div.appendChild(title_head);

                // === SELECTOR === //
                const div_selector = document.createElement("div");
                div_selector.style.display = "flex";

                div_selector.appendChild(create_button_enabler("📗", "Traduções",                       `G-${k}-msg`,  message == null,          not_obsolete));
                div_selector.appendChild(create_button_enabler("📕", "Traduções obsoletas",             `G-${k}-omsg`, old_message == null,      false));
                div_selector.appendChild(create_button_enabler("🌟", "Variações",                       `G-${k}-var`,  self.variants == null,    false));
                div_selector.appendChild(create_button_enabler("⭐", "Variações obsoletas",             `G-${k}-ovar`, self.old_variants == null,false));
                div_selector.appendChild(create_button_enabler("🔄", "Substituído por",                 `G-${k}-repl`, replacements == null,     !not_obsolete));
                
                // === MEANINGS === //
                const desc_div = document.createElement("div");

                if (message)                    desc_div.appendChild(message);
                if (old_message)                desc_div.appendChild(old_message);
                if (self.variants != null)      desc_div.appendChild(variants);
                if (self.old_variants != null)  desc_div.appendChild(old_variants);
                if (replacements)               desc_div.appendChild(replacements);

                base.appendChild(title_div);
                base.appendChild(div_selector);
                base.appendChild(desc_div);

                return base;

//                const base = document.createElement("div");
//                
//                const title_div = document.createElement("div");
//                const title_head = document.createElement("h2");
//
//                const desc_div = document.createElement("div");
//
//                // === TITLE === //
//                title_head.innerText = `${k}:`;
//                title_head.classList.add("lsw-bold");
//                title_head.classList.add("lsw-title");
//                title_head.classList.add("lsw-inline");
//                if (self.obsolete === true) title_head.classList.add("lsw-dict-obsolete");
//
//                title_div.classList.add("lsw-inline");
//                title_div.classList.add("lsw-arrowed");
//
//                // === Messages === //
//                const message       = create_list_of_array(self.message?.[lang_sel]);
//                const old_message   = create_list_of_array(self.old_message?.[lang_sel], ["lsw-dict-obsolete"]);
//                const variants      = create_list_of_array(self.variants?.message?.[lang_sel]);
//                const old_variants  = create_list_of_array(self.old_variants?.message?.[lang_sel], ["lsw-dict-obsolete"]);
//                const replacements  = create_list_of_array(self.replacements, ["lsw-dict-replacement"]);
//
//                title_div.appendChild(title_head);
//                base.appendChild(title_div);
//
//                if (message && self["obsolete"] !== true) {
//                    if (message) desc_div.appendChild(message);
//                    if (old_message) desc_div.appendChild(old_message);
//                    if (variants) desc_div.appendChild(variants);
//                    if (old_variants) desc_div.appendChild(old_variants);
//                    if (replacements) desc_div.appendChild(replacements);
//                }
//                else {
//                    if (replacements) desc_div.appendChild(replacements);
//                    if (old_message) desc_div.appendChild(old_message);
//                    if (variants) desc_div.appendChild(variants);
//                    if (old_variants) desc_div.appendChild(old_variants);
//                }
//
//
//                desc_div.classList.add("lsw-autoflex-up3");
//
//                base.appendChild(desc_div);
//
//                return base;
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

                    self.examples.forEach(each => {
                        if (!each.phrase || !each.message || Object.keys(each.message).length === 0) {
                            had_faulty_key = true;
                        }
                        for (language in each.message) {
                            if (typeof each.message[language] !== "string") {
                                had_faulty_message = true;
                            }
                        }
                    });

                    if (had_faulty_key) return "Faulty key in examples (phrase or message)";
                    if (had_faulty_message) return "Faulty message in examples messages (not string)";
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
        cases: [
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
            cases: []
        };

        const deconstructed_word = affixes.DeconstructWord(word);

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

        const found_base = base_names.filter(each => each.key.indexOf(deconstructed_word.base) !== -1);
        const found_variants = variants.filter(each => each.key.indexOf(deconstructed_word.base) !== -1);
        const found_old_variants = old_variants.filter(each => each.key.indexOf(deconstructed_word.base) !== -1);
        const found_replacements = replacements.filter(each => each.key.indexOf(deconstructed_word.base) !== -1);

        const found = [...found_base, ...found_variants, ...found_old_variants, ...found_replacements];

        if (found.length === 0) return res;

        res.perfect_matches = found.filter(each => !each.old_or_replacement && each.key === word);
        res.cases = found;
        
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
        cases: [
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
            cases: []
        };

        const found = [];

        Object.keys(this.data).forEach(k => {
            const self = dict.data[k];

            const self_messages = self.message?.[lang_sel]?.filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: false }; }) || [];
            const self_old_messages = self.old_message?.[lang_sel].filter(msg => msg.indexOf(message) !== -1).flatMap(function(msg){ return {key: msg, src: {[k]: self}, old_or_replacement: true }; }) || [];

            if (self_messages.length) found.push(...self_messages);
            if (self_old_messages.length) found.push(...self_old_messages);
        });

        res.perfect_matches = found.filter(each => !each.old_or_replacement && each.key === message);
        res.cases = found;

        return res;
    },

    // Combines Larinuim and Translated results in one
    Search: function(word) {
        const larinuim = this._SearchLarinuim(word);
        const translated = this._SearchTranslated(word);

        return {
            perfect_matches: [...larinuim.perfect_matches, ...translated.perfect_matches],
            cases: [...larinuim.cases, ...translated.cases]
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
                        br: "você é bonito"
                    }
                },
                {
                    phrase: "ae pod jap",
                    message: {
                        br: "ele pode voar"
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
                        br: "isso é divertido"
                    }
                },
                {
                    phrase: "maol ai tuepa wafku",
                    message: {
                        br: "então isso foi concluído"
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
                        br: "o dinheiro é nosso (do grupo da pessoa falando)"
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
                        br: "nosso pão de cada dia (todos aplicáveis)"
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
            examples: [],
            variants: null
        },
        ea: {
            message: {
                br: [
                    "seu",
                    "sua"
                ]
            },
            examples: [],
            variants: null
        },
        eu: {
            message: {
                br: [
                    "meu",
                    "minha"
                ]
            },
            examples: [],
            variants: null
        },
        sa: {
            message: {
                br: [
                    "nós"
                ]
            },
            examples: [],
            variants: null
        },
        ua: {
            message: {
                br: [
                    "nós"
                ]
            },
            examples: [],
            variants: null
        },
        ue: {
            message: {
                br: [
                    "eu"
                ]
            },
            examples: [],
            variants: null
        },
        va: {
            message: {
                br: [
                    "eles",
                    "vocês"
                ]
            },
            examples: [],
            variants: null
        },
        wa: {
            message: {
                br: [
                    "aquilo"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        alg: {
            message: {
                br: [
                    "almoçar",
                    "lanchar",
                    "entupir",
                    "pintar",
                    "pincelar",
                    "comer",
                    "preencher"
                ]
            },
            examples: [],
            variants: null
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
                    "retornar",
                    "devolver"
                ]
            },
            examples: [],
            variants: null
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
                    phrase: "espa trta eu dyd lolk ae?",
                    message: {
                        br: "Por que eu duvido de você?"
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
                    "abortar"
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
            examples: [],
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
                            "aborto"
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        gto: {
            message: {
                br: [
                    "gostar",
                    "apreciar"
                ]
            },
            examples: [],
            variants: null
        },
        guk: {
            message: {
                br: [
                    "subir"
                ]
            },
            examples: [],
            variants: null
        },
        hug: {
            message: {
                br: [
                    "avisar"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        ihk: {
            message: {
                br: [
                    "adorar"
                ]
            },
            examples: [],
            variants: null
        },
        ike: {
            message: {
                br: [
                    "dever"
                ]
            },
            examples: [],
            variants: null
        },
        iki: {
            message: {
                br: [
                    "merecer"
                ]
            },
            examples: [],
            variants: null
        },
        ikk: {
            message: {
                br: [
                    "atrapalhar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        jip: {
            message: {
                br: [
                    "beijar"
                ]
            },
            examples: [],
            variants: null
        },
        jki: {
            message: {
                br: [
                    "lavar"
                ]
            },
            examples: [],
            variants: null
        },
        jol: {
            message: {
                br: [
                    "bater",
                    "golpear"
                ]
            },
            examples: [],
            variants: null
        },
        kaa: {
            message: {
                br: [
                    "exigir",
                    "invocar"
                ]
            },
            examples: [],
            variants: null
        },
        kei: {
            message: {
                br: [
                    "encher",
                    "servir"
                ]
            },
            examples: [],
            variants: null
        },
        kek: {
            message: {
                br: [
                    "desapontar"
                ]
            },
            examples: [],
            variants: null
        },
        kgo: {
            message: {
                br: [
                    "libertar"
                ]
            },
            examples: [],
            variants: null
        },
        kik: {
            message: {
                br: [
                    "dormir"
                ]
            },
            examples: [],
            variants: null
        },
        kok: {
            message: {
                br: [
                    "veja"
                ]
            },
            examples: [],
            variants: null
        },
        kop: {
            message: {
                br: [
                    "colaborar",
                    "participar"
                ]
            },
            examples: [],
            variants: null
        },
        koy: {
            message: {
                br: [
                    "amassar",
                    "amocar"
                ]
            },
            examples: [],
            variants: null
        },
        krk: {
            message: {
                br: [
                    "atualizar"
                ]
            },
            examples: [],
            variants: null
        },
        kro: {
            message: {
                br: [
                    "fazer"
                ]
            },
            examples: [],
            variants: null
        },
        lak: {
            message: {
                br: [
                    "abaixar"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        lay: {
            message: {
                br: [
                    "escutar",
                    "ouvir"
                ]
            },
            examples: [],
            variants: null
        },
        laz: {
            message: {
                br: [
                    "iluminar"
                ]
            },
            examples: [],
            variants: null
        },
        lea: {
            message: {
                br: [
                    "parar"
                ]
            },
            examples: [],
            variants: null
        },
        leh: {
            message: {
                br: [
                    "adivinhar"
                ]
            },
            examples: [],
            variants: null
        },
        lep: {
            message: {
                br: [
                    "brincar"
                ]
            },
            examples: [],
            variants: null
        },
        lii: {
            message: {
                br: [
                    "sorrir"
                ]
            },
            examples: [],
            variants: null
        },
        lio: {
            message: {
                br: [
                    "entender"
                ]
            },
            examples: [],
            variants: null
        },
        lod: {
            message: {
                br: [
                    "estudar"
                ]
            },
            examples: [],
            variants: null
        },
        lof: {
            message: {
                br: [
                    "odiar"
                ]
            },
            examples: [],
            variants: null
        },
        log: {
            message: {
                br: [
                    "chutar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        lra: {
            message: {
                br: [
                    "cantar"
                ]
            },
            examples: [],
            variants: null
        },
        lui: {
            message: {
                br: [
                    "existir",
                    "haver"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        nag: {
            message: {
                br: [
                    "estressar"
                ]
            },
            examples: [],
            variants: null
        },
        nak: {
            message: {
                br: [
                    "cochilar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        naz: {
            message: {
                br: [
                    "descansar"
                ]
            },
            examples: [],
            variants: null
        },
        neh: {
            message: {
                br: [
                    "nascer"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        nih: {
            message: {
                br: [
                    "renascer"
                ]
            },
            examples: [],
            variants: null
        },
        nog: {
            message: {
                br: [
                    "chegar",
                    "vir"
                ]
            },
            examples: [],
            variants: null
        },
        obs: {
            message: {
                br: [
                    "observar"
                ]
            },
            examples: [],
            variants: null
        },
        ofi: {
            message: {
                br: [
                    "trepar"
                ]
            },
            examples: [],
            variants: null
        },
        oky: {
            message: {
                br: [
                    "agradecer"
                ]
            },
            examples: [],
            variants: null
        },
        ole: {
            message: {
                br: [
                    "apagar"
                ]
            },
            examples: [],
            variants: null
        },
        olf: {
            message: {
                br: [
                    "remover"
                ]
            },
            examples: [],
            variants: null
        },
        olg: {
            message: {
                br: [
                    "acabar"
                ]
            },
            examples: [],
            variants: null
        },
        oli: {
            message: {
                br: [
                    "dar"
                ]
            },
            examples: [],
            variants: null
        },
        olk: {
            message: {
                br: [
                    "adiar"
                ]
            },
            examples: [],
            variants: null
        },
        ori: {
            message: {
                br: [
                    "fechar"
                ]
            },
            examples: [],
            variants: null
        },
        par: {
            message: {
                br: [
                    "enfiar"
                ]
            },
            examples: [],
            variants: null
        },
        pie: {
            message: {
                br: [
                    "viajar"
                ]
            },
            examples: [],
            variants: null
        },
        pka: {
            message: {
                br: [
                    "sapatear"
                ]
            },
            examples: [],
            variants: null
        },
        plk: {
            message: {
                br: [
                    "responder"
                ]
            },
            examples: [],
            variants: null
        },
        plo: {
            message: {
                br: [
                    "abrir"
                ]
            },
            examples: [],
            variants: null
        },
        pod: {
            message: {
                br: [
                    "poder"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        pra: {
            message: {
                br: [
                    "escutar"
                ]
            },
            examples: [],
            variants: null
        },
        pre: {
            message: {
                br: [
                    "assinar",
                    "declarar"
                ]
            },
            examples: [],
            variants: null
        },
        pri: {
            message: {
                br: [
                    "entrar",
                    "visitar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        qnm: {
            message: {
                br: [
                    "salvar"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        reh: {
            message: {
                br: [
                    "pagar"
                ]
            },
            examples: [],
            variants: null
        },
        rka: {
            message: {
                br: [
                    "gravar"
                ]
            },
            examples: [],
            variants: null
        },
        rud: {
            message: {
                br: [
                    "prestar"
                ]
            },
            examples: [],
            variants: null
        },
        ruh: {
            message: {
                br: [
                    "sair"
                ]
            },
            examples: [],
            variants: null
        },
        rye: {
            message: {
                br: [
                    "enviar",
                    "escrever"
                ]
            },
            examples: [],
            variants: null
        },
        ryi: {
            message: {
                br: [
                    "passar"
                ]
            },
            examples: [],
            variants: null
        },
        saa: {
            message: {
                br: [
                    "prometer"
                ]
            },
            examples: [],
            variants: null
        },
        saf: {
            message: {
                br: [
                    "abusar"
                ]
            },
            examples: [],
            variants: null
        },
        sak: {
            message: {
                br: [
                    "faltar"
                ]
            },
            examples: [],
            variants: null
        },
        sea: {
            message: {
                br: [
                    "comprometer"
                ]
            },
            examples: [],
            variants: null
        },
        sek: {
            message: {
                br: [
                    "colocar",
                    "por"
                ]
            },
            examples: [],
            variants: null
        },
        sem: {
            message: {
                br: [
                    "deixar"
                ]
            },
            examples: [],
            variants: null
        },
        sfy: {
            message: {
                br: [
                    "filosofar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        ska: {
            message: {
                br: [
                    "dançar"
                ]
            },
            examples: [],
            variants: null
        },
        sle: {
            message: {
                br: [
                    "faxinar"
                ]
            },
            examples: [],
            variants: null
        },
        squ: {
            message: {
                br: [
                    "monitorar"
                ]
            },
            examples: [],
            variants: null
        },
        sru: {
            message: {
                br: [
                    "tentar"
                ]
            },
            examples: [],
            variants: null
        },
        sue: {
            message: {
                br: [
                    "abraçar"
                ]
            },
            examples: [],
            variants: null
        },
        suk: {
            message: {
                br: [
                    "editar"
                ]
            },
            examples: [],
            variants: null
        },
        swa: {
            message: {
                br: [
                    "pirar"
                ]
            },
            examples: [],
            variants: null
        },
        swi: {
            message: {
                br: [
                    "voltar",
                    "desfazer"
                ]
            },
            examples: [],
            variants: null
        },
        tar: {
            message: {
                br: [
                    "ter"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        tnu: {
            message: {
                br: [
                    "sobreviver",
                    "viver"
                ]
            },
            examples: [],
            variants: null
        },
        tol: {
            message: {
                br: [
                    "ganhar",
                    "vencer"
                ]
            },
            examples: [],
            variants: null
        },
        top: {
            message: {
                br: [
                    "ficar"
                ]
            },
            examples: [],
            variants: null
        },
        tra: {
            message: {
                br: [
                    "importar"
                ]
            },
            examples: [],
            variants: null
        },
        tre: {
            message: {
                br: [
                    "aceitar"
                ]
            },
            examples: [],
            variants: null
        },
        tua: {
            message: {
                br: [
                    "socializar"
                ]
            },
            examples: [],
            variants: null
        },
        tue: {
            message: {
                br: [
                    "estar",
                    "ser"
                ]
            },
            examples: [],
            variants: null
        },
        tyh: {
            message: {
                br: [
                    "cuidar"
                ]
            },
            examples: [],
            variants: null
        },
        ugs: {
            message: {
                br: [
                    "retornar",
                    "voltar"
                ]
            },
            examples: [],
            variants: null
        },
        uhm: {
            message: {
                br: [
                    "precisar"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        uru: {
            message: {
                br: [
                    "memorizar"
                ]
            },
            examples: [],
            variants: null
        },
        uwe: {
            message: {
                br: [
                    "aguardar",
                    "esperar"
                ]
            },
            examples: [],
            variants: null
        },
        uwo: {
            message: {
                br: [
                    "cozinhar"
                ]
            },
            examples: [],
            variants: null
        },
        uyo: {
            message: {
                br: [
                    "amar"
                ]
            },
            examples: [],
            variants: null
        },
        waa: {
            message: {
                br: [
                    "ousar"
                ]
            },
            examples: [],
            variants: null
        },
        wab: {
            message: {
                br: [
                    "trocar"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        waf: {
            message: {
                br: [
                    "concluir"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        wre: {
            message: {
                br: [
                    "cercar"
                ]
            },
            examples: [],
            variants: null
        },
        wri: {
            message: {
                br: [
                    "reclamar"
                ]
            },
            examples: [],
            variants: null
        },
        wug: {
            message: {
                br: [
                    "cansar"
                ]
            },
            examples: [],
            variants: null
        },
        wum: {
            message: {
                br: [
                    "acordar"
                ]
            },
            examples: [],
            variants: null
        },
        wyt: {
            message: {
                br: [
                    "cortar",
                    "machucar"
                ]
            },
            examples: [],
            variants: null
        },
        xur: {
            message: {
                br: [
                    "atender"
                ]
            },
            examples: [],
            variants: null
        },
        yaa: {
            message: {
                br: [
                    "significar",
                    "valer"
                ]
            },
            examples: [],
            variants: null
        },
        yhe: {
            message: {
                br: [
                    "esquecer"
                ]
            },
            examples: [],
            variants: null
        },
        yio: {
            message: {
                br: [
                    "abandonar"
                ]
            },
            examples: [],
            variants: null
        },
        yte: {
            message: {
                br: [
                    "aproximar"
                ]
            },
            examples: [],
            variants: null
        },
        zno: {
            message: {
                br: [
                    "sentir"
                ]
            },
            examples: [],
            variants: null
        },
        zon: {
            message: {
                br: [
                    "saber"
                ]
            },
            examples: [],
            variants: null
        },
        zuh: {
            message: {
                br: [
                    "morrer"
                ]
            },
            examples: [],
            variants: null
        },
        wue: {
            message: {
                br: [
                    "trocado para => koy"
                ]
            },
            examples: [],
            variants: null
        },
        dea: {
            message: {
                br: [
                    "trocado para => dec",
                    "achar"
                ]
            },
            examples: [],
            variants: null
        },
        anne: {
            message: {
                br: [
                    "macaco"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        alul: {
            message: {
                br: [
                    "cavalo"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        aved: {
            message: {
                br: [
                    "talvez"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        bofo: {
            message: {
                br: [
                    "brócolis"
                ]
            },
            examples: [],
            variants: null
        },
        brad: {
            message: {
                br: [
                    "pão",
                    "massa"
                ]
            },
            examples: [],
            variants: null
        },
        brod: {
            message: {
                br: [
                    "comida",
                    "alimento",
                    "refeição",
                    "lanche",
                    "piquenique",
                    "remédio",
                    "ingerível"
                ]
            },
            examples: [],
            variants: null
        },
        brot: {
            message: {
                br: [
                    "boca",
                    "orifício"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        cite: {
            message: {
                br: [
                    "cinco"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        clon: {
            message: {
                br: [
                    "com",
                    "como"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        delf: {
            message: {
                br: [
                    "fofo"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        dude: {
            message: {
                br: [
                    "dois"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        duly: {
            message: {
                br: [
                    "plural",
                    "múltiplo"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        ebae: {
            message: {
                br: [
                    "asfalto"
                ]
            },
            examples: [],
            variants: null
        },
        edof: {
            message: {
                br: [
                    "dinheiro",
                    "moeda"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        enge: {
            message: {
                br: [
                    "engenharia",
                    "engenheiro"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        espe: {
            message: {
                br: [
                    "alface"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
                    "medicamento"
                ]
            },
            examples: [],
            variants: null
        },
        ewrk: {
            message: {
                br: [
                    "borracha",
                    "pneu"
                ]
            },
            examples: [],
            variants: null
        },
        fafa: {
            message: {
                br: [
                    "minuto"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        fpra: {
            message: {
                br: [
                    "conta",
                    "contato"
                ]
            },
            examples: [],
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
            examples: [],
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
                        br: "eu (sou) / (tenho um(a)) (órgão do sexo feminino)"
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
                        br: "interessado em sexo feminino (homossexual ou hétero dependendo do sujeito)"
                    }
                },
                {
                    phrase: "nafraq",
                    message: {
                        br: "interessado em sexo masculino (homossexual ou hétero dependendo do sujeito)"
                    }
                },
                {
                    phrase: "fraq",
                    message: {
                        br: "interessado em qualquer sexo ou indefinido"
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        ftuk: {
            message: {
                br: [
                    "sanduíche",
                    "hambúrguer"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
                        br: "você está \"precisando de ajuda\""
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        grak: {
            message: {
                br: [
                    "bicho",
                    "verme"
                ]
            },
            examples: [],
            variants: null
        },
        grin: {
            message: {
                br: [
                    "guitarra",
                    "violão elétrico"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        gron: {
            message: {
                br: [
                    "utilize => abdku"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        guni: {
            message: {
                br: [
                    "ideia",
                    "sugestão"
                ]
            },
            examples: [],
            variants: null
        },
        gura: {
            message: {
                br: [
                    "bola",
                    "esfera"
                ]
            },
            examples: [],
            variants: null
        },
        gure: {
            message: {
                br: [
                    "informação",
                    "notícia"
                ]
            },
            examples: [],
            variants: null
        },
        gyla: {
            message: {
                br: [
                    "ritmo",
                    "movimento"
                ]
            },
            examples: [],
            variants: null
        },
        gyth: {
            message: {
                br: [
                    "chocolate"
                ]
            },
            examples: [],
            variants: null
        },
        hugi: {
            message: {
                br: [
                    "conteúdo",
                    "matéria"
                ]
            },
            examples: [],
            variants: null
        },
        hune: {
            message: {
                br: [
                    "casamento"
                ]
            },
            examples: [],
            variants: null
        },
        hung: {
            message: {
                br: [
                    "sal"
                ]
            },
            examples: [],
            variants: null
        },
        hute: {
            message: {
                br: [
                    "casa"
                ]
            },
            examples: [],
            variants: null
        },
        huti: {
            message: {
                br: [
                    "ânus"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        hyor: {
            message: {
                br: [
                    "rua"
                ]
            },
            examples: [],
            variants: null
        },
        iata: {
            message: {
                br: [
                    "título",
                    "topo"
                ]
            },
            examples: [],
            variants: null
        },
        iceb: {
            message: {
                br: [
                    "cebola"
                ]
            },
            examples: [],
            variants: null
        },
        igrn: {
            message: {
                br: [
                    "veado"
                ]
            },
            examples: [],
            variants: null
        },
        ihgl: {
            message: {
                br: [
                    "inglês"
                ]
            },
            examples: [],
            variants: null
        },
        ilpe: {
            message: {
                br: [
                    "caldo"
                ]
            },
            examples: [],
            variants: null
        },
        issu: {
            message: {
                br: [
                    "calcanhar"
                ]
            },
            examples: [],
            variants: null
        },
        isti: {
            message: {
                br: [
                    "ovíparo"
                ]
            },
            examples: [],
            variants: null
        },
        isto: {
            message: {
                br: [
                    "herbívoro"
                ]
            },
            examples: [],
            variants: null
        },
        itep: {
            message: {
                br: [
                    "tempero",
                    "orégano"
                ]
            },
            examples: [],
            variants: null
        },
        jfab: {
            message: {
                br: [
                    "faculdade"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        joqe: {
            message: {
                br: [
                    "joystick"
                ]
            },
            examples: [],
            variants: null
        },
        julk: {
            message: {
                br: [
                    "foda"
                ]
            },
            examples: [],
            variants: null
        },
        kaet: {
            message: {
                br: [
                    "pobre",
                    "pobreza"
                ]
            },
            examples: [],
            variants: null
        },
        kaga: {
            message: {
                br: [
                    "mercado",
                    "shopping"
                ]
            },
            examples: [],
            variants: null
        },
        kaka: {
            message: {
                br: [
                    "atrevido"
                ]
            },
            examples: [],
            variants: null
        },
        kala: {
            message: {
                br: [
                    "caramba"
                ]
            },
            examples: [],
            variants: null
        },
        kara: {
            message: {
                br: [
                    "loucura"
                ]
            },
            examples: [],
            variants: null
        },
        kark: {
            message: {
                br: [
                    "atualização"
                ]
            },
            examples: [],
            variants: null
        },
        kefh: {
            message: {
                br: [
                    "tia",
                    "tio"
                ]
            },
            examples: [],
            variants: null
        },
        kerk: {
            message: {
                br: [
                    "desatualização"
                ]
            },
            examples: [],
            variants: null
        },
        kina: {
            message: {
                br: [
                    "vegetal"
                ]
            },
            examples: [],
            variants: null
        },
        kini: {
            message: {
                br: [
                    "episódio",
                    "caso"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        klan: {
            message: {
                br: [
                    "grupo",
                    "time"
                ]
            },
            examples: [],
            variants: null
        },
        klet: {
            message: {
                br: [
                    "barriga"
                ]
            },
            examples: [],
            variants: null
        },
        klin: {
            message: {
                br: [
                    "até",
                    "tchau"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        knet: {
            message: {
                br: [
                    "série"
                ]
            },
            examples: [],
            variants: null
        },
        knyh: {
            message: {
                br: [
                    "briga",
                    "luta"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        krat: {
            message: {
                br: [
                    "problema"
                ]
            },
            examples: [],
            variants: null
        },
        krfi: {
            message: {
                br: [
                    "favor"
                ]
            },
            examples: [],
            variants: null
        },
        krka: {
            message: {
                br: [
                    "preso"
                ]
            },
            examples: [],
            variants: null
        },
        kruk: {
            message: {
                br: [
                    "tradução"
                ]
            },
            examples: [],
            variants: null
        },
        ktra: {
            message: {
                br: [
                    "entre"
                ]
            },
            examples: [],
            variants: null
        },
        ktuh: {
            message: {
                br: [
                    "atenção"
                ]
            },
            examples: [],
            variants: null
        },
        kuil: {
            message: {
                br: [
                    "saúde"
                ]
            },
            examples: [],
            variants: null
        },
        kuky: {
            message: {
                br: [
                    "céu"
                ]
            },
            examples: [],
            variants: null
        },
        kulh: {
            message: {
                br: [
                    "máquina"
                ]
            },
            examples: [],
            variants: null
        },
        kurp: {
            message: {
                br: [
                    "inútil"
                ]
            },
            examples: [],
            variants: null
        },
        kwyh: {
            message: {
                br: [
                    "espaço (não muito grande)",
                    "quarto"
                ]
            },
            examples: [],
            variants: null
        },
        kyek: {
            message: {
                br: [
                    "mendigo"
                ]
            },
            examples: [],
            variants: null
        },
        kyia: {
            message: {
                br: [
                    "oi",
                    "olá"
                ]
            },
            examples: [],
            variants: null
        },
        kyna: {
            message: {
                br: [
                    "porra"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        larb: {
            message: {
                br: [
                    "trabalhador"
                ]
            },
            examples: [],
            variants: null
        },
        lare: {
            message: {
                br: [
                    "alguém"
                ]
            },
            examples: [],
            variants: null
        },
        lari: {
            message: {
                br: [
                    "algum",
                    "alguma"
                ]
            },
            examples: [],
            variants: null
        },
        lark: {
            message: {
                br: [
                    "ocupado"
                ]
            },
            examples: [],
            variants: null
        },
        lhun: {
            message: {
                br: [
                    "pulso"
                ]
            },
            examples: [],
            variants: null
        },
        lide: {
            message: {
                br: [
                    "ímã"
                ]
            },
            examples: [],
            variants: null
        },
        lifu: {
            message: {
                br: [
                    "decepcionado",
                    "desmotivado"
                ]
            },
            examples: [],
            variants: null
        },
        liit: {
            message: {
                br: [
                    "frio",
                    "inverno"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        lili: {
            message: {
                br: [
                    "riso"
                ]
            },
            examples: [],
            variants: null
        },
        lily: {
            message: {
                br: [
                    "sorriso"
                ]
            },
            examples: [],
            variants: null
        },
        limy: {
            message: {
                br: [
                    "biscoito",
                    "bolacha"
                ]
            },
            examples: [],
            variants: null
        },
        lint: {
            message: {
                br: [
                    "língua"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        lofh: {
            message: {
                br: [
                    "padrinho",
                    "madrinha"
                ]
            },
            examples: [],
            variants: null
        },
        lofi: {
            message: {
                br: [
                    "branco"
                ]
            },
            examples: [],
            variants: null
        },
        lohp: {
            message: {
                br: [
                    "trás"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        lokl: {
            message: {
                br: [
                    "acaso"
                ]
            },
            examples: [],
            variants: null
        },
        lokt: {
            message: {
                br: [
                    "para",
                    "pra"
                ]
            },
            examples: [],
            variants: null
        },
        loku: {
            message: {
                br: [
                    "osso"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        lolo: {
            message: {
                br: [
                    "ovo"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        lowe: {
            message: {
                br: [
                    "universidade"
                ]
            },
            examples: [],
            variants: null
        },
        lual: {
            message: {
                br: [
                    "viagem"
                ]
            },
            examples: [],
            variants: null
        },
        luka: {
            message: {
                br: [
                    "perna"
                ]
            },
            examples: [],
            variants: null
        },
        luly: {
            message: {
                br: [
                    "semente"
                ]
            },
            examples: [],
            variants: null
        },
        lumu: {
            message: {
                br: [
                    "caderno",
                    "livro"
                ]
            },
            examples: [],
            variants: null
        },
        lung: {
            message: {
                br: [
                    "ombro"
                ]
            },
            examples: [],
            variants: null
        },
        luph: {
            message: {
                br: [
                    "coxa"
                ]
            },
            examples: [],
            variants: null
        },
        lurd: {
            message: {
                br: [
                    "distante",
                    "longe"
                ]
            },
            examples: [],
            variants: null
        },
        lure: {
            message: {
                br: [
                    "gênio",
                    "inteligente"
                ]
            },
            examples: [],
            variants: null
        },
        luyo: {
            message: {
                br: [
                    "dragão"
                ]
            },
            examples: [],
            variants: null
        },
        lyka: {
            message: {
                br: [
                    "reino"
                ]
            },
            examples: [],
            variants: null
        },
        lyru: {
            message: {
                br: [
                    "feio"
                ]
            },
            examples: [],
            variants: null
        },
        lyvo: {
            message: {
                br: [
                    "mesquinho",
                    "fútil"
                ]
            },
            examples: [],
            variants: null
        },
        maly: {
            message: {
                br: [
                    "redação",
                    "texto"
                ]
            },
            examples: [],
            variants: null
        },
        maah: {
            message: {
                br: [
                    "sim",
                    "claro"
                ]
            },
            examples: [],
            variants: null
        },
        maeh: {
            message: {
                br: [
                    "certeza "
                ]
            },
            examples: [],
            variants: null
        },
        mana: {
            message: {
                br: [
                    "não",
                    "incerto"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        maol: {
            message: {
                br: [
                    "então",
                    "portanto"
                ]
            },
            examples: [],
            variants: null
        },
        medy: {
            message: {
                br: [
                    "medicina",
                    "médico"
                ]
            },
            examples: [],
            variants: null
        },
        mhat: {
            message: {
                br: [
                    "matemática"
                ]
            },
            examples: [],
            variants: null
        },
        mhut: {
            message: {
                br: [
                    "constante",
                    "estável"
                ]
            },
            examples: [],
            variants: null
        },
        molg: {
            message: {
                br: [
                    "macarrão"
                ]
            },
            examples: [],
            variants: null
        },
        molh: {
            message: {
                br: [
                    "boi",
                    "vaca"
                ]
            },
            examples: [],
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
                        br: "1.1, um vírgula um, um 'ponto' um"
                    }
                },
                {
                    phrase: "muka qute mula troe qute",
                    message: {
                        br: "0.40004, zero vírgula quarenta mil e quatro, quatro 'zeros vezes' três quatro"
                    }
                }
            ],
            variants: null
        },
        mula: {
            message: {
                br: [
                    "multiplicador",
                    "(indicador de potência de 10, verifique exemplos)",
                ]
            },
            examples: [
                {
                    phrase: "ohde mula ohde",
                    message: {
                        br: "10, dez, um 'zeros vezes' um"
                    }
                },
                {
                    phrase: "qute troe mula troe ohde muka ohde uhso ohde",
                    message: {
                        br: "430001.101, quatrocentos e trinta mil e um vírgula um zero um, quatro três 'zeros vezes' três um 'ponto' um zero um"
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
            examples: [],
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
            examples: [],
            variants: null
        },
        nagt: {
            message: {
                br: [
                    "estresse"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        nheh: {
            message: {
                br: [
                    "igreja"
                ]
            },
            examples: [],
            variants: null
        },
        nhoe: {
            message: {
                br: [
                    "nove"
                ]
            },
            examples: [],
            variants: null
        },
        nhum: {
            message: {
                br: [
                    "sorte"
                ]
            },
            examples: [],
            variants: null
        },
        nili: {
            message: {
                br: [
                    "frase "
                ]
            },
            examples: [],
            variants: null
        },
        njvn: {
            message: {
                br: [
                    "alho"
                ]
            },
            examples: [],
            variants: null
        },
        noag: {
            message: {
                br: [
                    "batata"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        nolc: {
            message: {
                br: [
                    "anti",
                    "sem"
                ]
            },
            examples: [],
            variants: null
        },
        nuki: {
            message: {
                br: [
                    "coitado"
                ]
            },
            examples: [],
            variants: null
        },
        nukn: {
            message: {
                br: [
                    "colaboração"
                ]
            },
            examples: [],
            variants: null
        },
        nune: {
            message: {
                br: [
                    "fluente"
                ]
            },
            examples: [],
            variants: null
        },
        nury: {
            message: {
                br: [
                    "permanente",
                    "para sempre"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        nyil: {
            message: {
                br: [
                    "pior"
                ]
            },
            examples: [],
            variants: null
        },
        nyta: {
            message: {
                br: [
                    "química",
                    "químico"
                ]
            },
            examples: [],
            variants: null
        },
        oaut: {
            message: {
                br: [
                    "espelho"
                ]
            },
            examples: [],
            variants: null
        },
        ohde: {
            message: {
                br: [
                    "um",
                    "uma"
                ]
            },
            examples: [],
            variants: null
        },
        ohte: {
            message: {
                br: [
                    "oito"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        otsi: {
            message: {
                br: [
                    "carnívoro"
                ]
            },
            examples: [],
            variants: null
        },
        otun: {
            message: {
                br: [
                    "música",
                    "músico"
                ]
            },
            examples: [],
            variants: null
        },
        ougt: {
            message: {
                br: [
                    "olho"
                ]
            },
            examples: [],
            variants: null
        },
        oyye: {
            message: {
                br: [
                    "loiro"
                ]
            },
            examples: [],
            variants: null
        },
        ozuk: {
            message: {
                br: [
                    "onda"
                ]
            },
            examples: [],
            variants: null
        },
        pane: {
            message: {
                br: [
                    "próton"
                ]
            },
            examples: [],
            variants: null
        },
        pate: {
            message: {
                br: [
                    "planta",
                    "árvore"
                ]
            },
            examples: [],
            variants: null
        },
        paut: {
            message: {
                br: [
                    "caralho"
                ]
            },
            examples: [],
            variants: null
        },
        pedt: {
            message: {
                br: [
                    "antes",
                    "último"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        phaf: {
            message: {
                br: [
                    "farmacêutico",
                    "farmácia"
                ]
            },
            examples: [],
            variants: null
        },
        phed: {
            message: {
                br: [
                    "foto",
                    "imagem"
                ]
            },
            examples: [],
            variants: null
        },
        phlo: {
            message: {
                br: [
                    "alto"
                ]
            },
            examples: [],
            variants: null
        },
        phoa: {
            message: {
                br: [
                    "fone"
                ]
            },
            examples: [],
            variants: null
        },
        phor: {
            message: {
                br: [
                    "português"
                ]
            },
            examples: [],
            variants: null
        },
        phuf: {
            message: {
                br: [
                    "cotovelada"
                ]
            },
            examples: [],
            variants: null
        },
        phus: {
            message: {
                br: [
                    "física"
                ]
            },
            examples: [],
            variants: null
        },
        pitn: {
            message: {
                br: [
                    "nariz"
                ]
            },
            examples: [],
            variants: null
        },
        pikt: {
            message: {
                br: [
                    "alicate"
                ]
            },
            examples: [],
            variants: null
        },
        plar: {
            message: {
                br: [
                    "trabalho"
                ]
            },
            examples: [],
            variants: null
        },
        plep: {
            message: {
                br: [
                    "café",
                    "cafeína"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        plug: {
            message: {
                br: [
                    "pulsação"
                ]
            },
            examples: [],
            variants: null
        },
        poad: {
            message: {
                br: [
                    "massa"
                ]
            },
            examples: [],
            variants: null
        },
        poag: {
            message: {
                br: [
                    "manteiga"
                ]
            },
            examples: [],
            variants: null
        },
        podr: {
            message: {
                br: [
                    "capô"
                ]
            },
            examples: [],
            variants: null
        },
        pody: {
            message: {
                br: [
                    "pudim",
                    "pé"
                ]
            },
            examples: [],
            variants: null
        },
        pofh: {
            message: {
                br: [
                    "chute"
                ]
            },
            examples: [],
            variants: null
        },
        poje: {
            message: {
                br: [
                    "padre"
                ]
            },
            examples: [],
            variants: null
        },
        pola: {
            message: {
                br: [
                    "saco"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        polh: {
            message: {
                br: [
                    "joelhada"
                ]
            },
            examples: [],
            variants: null
        },
        polt: {
            message: {
                br: [
                    "lábio"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        pora: {
            message: {
                br: [
                    "futebol"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        potr: {
            message: {
                br: [
                    "penal"
                ]
            },
            examples: [],
            variants: null
        },
        pous: {
            message: {
                br: [
                    "sopa"
                ]
            },
            examples: [],
            variants: null
        },
        praf: {
            message: {
                br: [
                    "pediatra",
                    "pediatria"
                ]
            },
            examples: [],
            variants: null
        },
        pred: {
            message: {
                br: [
                    "som"
                ]
            },
            examples: [],
            variants: null
        },
        proe: {
            message: {
                br: [
                    "adaptador",
                    "conector"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        ptha: {
            message: {
                br: [
                    "plástico"
                ]
            },
            examples: [],
            variants: null
        },
        ptos: {
            message: {
                br: [
                    "geralmente"
                ]
            },
            examples: [],
            variants: null
        },
        puag: {
            message: {
                br: [
                    "margarina"
                ]
            },
            examples: [],
            variants: null
        },
        pulh: {
            message: {
                br: [
                    "porco"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        qene: {
            message: {
                br: [
                    "quente"
                ]
            },
            examples: [],
            variants: null
        },
        qnad: {
            message: {
                br: [
                    "quando"
                ]
            },
            examples: [],
            variants: null
        },
        qute: {
            message: {
                br: [
                    "quatro"
                ]
            },
            examples: [],
            variants: null
        },
        qwut: {
            message: {
                br: [
                    "malandragem",
                    "malandro"
                ]
            },
            examples: [],
            variants: null
        },
        raki: {
            message: {
                br: [
                    "guerra"
                ]
            },
            examples: [],
            variants: null
        },
        raih: {
            message: {
                br: [
                    "assim"
                ]
            },
            examples: [],
            variants: null
        },
        raik: {
            message: {
                br: [
                    "martelo"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        rauk: {
            message: {
                br: [
                    "sonho"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        regh: {
            message: {
                br: [
                    "relógio"
                ]
            },
            examples: [],
            variants: null
        },
        reka: {
            message: {
                br: [
                    "aqui"
                ]
            },
            examples: [],
            variants: null
        },
        reko: {
            message: {
                br: [
                    "rumo"
                ]
            },
            examples: [],
            variants: null
        },
        rela: {
            message: {
                br: [
                    "ali"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        relh: {
            message: {
                br: [
                    "avestruz"
                ]
            },
            examples: [],
            variants: null
        },
        rhfa: {
            message: {
                br: [
                    "rádio"
                ]
            },
            examples: [],
            variants: null
        },
        rhis: {
            message: {
                br: [
                    "história"
                ]
            },
            examples: [],
            variants: null
        },
        rifn: {
            message: {
                br: [
                    "cabelo"
                ]
            },
            examples: [],
            variants: null
        },
        ripy: {
            message: {
                br: [
                    "perigo"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        rote: {
            message: {
                br: [
                    "filme"
                ]
            },
            examples: [],
            variants: null
        },
        roti: {
            message: {
                br: [
                    "remoto"
                ]
            },
            examples: [],
            variants: null
        },
        ruka: {
            message: {
                br: [
                    "barra",
                    "régua"
                ]
            },
            examples: [],
            variants: null
        },
        ruky: {
            message: {
                br: [
                    "alavanca"
                ]
            },
            examples: [],
            variants: null
        },
        rury: {
            message: {
                br: [
                    "tipo"
                ]
            },
            examples: [],
            variants: null
        },
        rutu: {
            message: {
                br: [
                    "desenho"
                ]
            },
            examples: [],
            variants: null
        },
        rwes: {
            message: {
                br: [
                    "porta"
                ]
            },
            examples: [],
            variants: null
        },
        ryke: {
            message: {
                br: [
                    "droga",
                    "porcaria"
                ]
            },
            examples: [],
            variants: null
        },
        ryty: {
            message: {
                br: [
                    "início",
                    "menu"
                ]
            },
            examples: [],
            variants: null
        },
        saan: {
            message: {
                br: [
                    "bolado"
                ]
            },
            examples: [],
            variants: null
        },
        sadu: {
            message: {
                br: [
                    "separado"
                ]
            },
            examples: [],
            variants: null
        },
        saki: {
            message: {
                br: [
                    "paz"
                ]
            },
            examples: [],
            variants: null
        },
        salu: {
            message: {
                br: [
                    "cursinho",
                    "curso"
                ]
            },
            examples: [],
            variants: null
        },
        saqi: {
            message: {
                br: [
                    "idade"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        sase: {
            message: {
                br: [
                    "total"
                ]
            },
            examples: [],
            variants: null
        },
        sele: {
            message: {
                br: [
                    "nem"
                ]
            },
            examples: [],
            variants: null
        },
        shie: {
            message: {
                br: [
                    "ciências"
                ]
            },
            examples: [],
            variants: null
        },
        skaa: {
            message: {
                br: [
                    "janeiro"
                ]
            },
            examples: [],
            variants: null
        },
        skab: {
            message: {
                br: [
                    "fevereiro"
                ]
            },
            examples: [],
            variants: null
        },
        skac: {
            message: {
                br: [
                    "março"
                ]
            },
            examples: [],
            variants: null
        },
        skad: {
            message: {
                br: [
                    "abril"
                ]
            },
            examples: [],
            variants: null
        },
        skae: {
            message: {
                br: [
                    "maio"
                ]
            },
            examples: [],
            variants: null
        },
        skaf: {
            message: {
                br: [
                    "junho"
                ]
            },
            examples: [],
            variants: null
        },
        skag: {
            message: {
                br: [
                    "julho"
                ]
            },
            examples: [],
            variants: null
        },
        skah: {
            message: {
                br: [
                    "agosto"
                ]
            },
            examples: [],
            variants: null
        },
        skai: {
            message: {
                br: [
                    "setembro"
                ]
            },
            examples: [],
            variants: null
        },
        skaj: {
            message: {
                br: [
                    "outubro"
                ]
            },
            examples: [],
            variants: null
        },
        skak: {
            message: {
                br: [
                    "novembro"
                ]
            },
            examples: [],
            variants: null
        },
        skal: {
            message: {
                br: [
                    "dezembro"
                ]
            },
            examples: [],
            variants: null
        },
        skra: {
            message: {
                br: [
                    "imbecil"
                ]
            },
            examples: [],
            variants: null
        },
        slag: {
            message: {
                br: [
                    "salgado"
                ]
            },
            examples: [],
            variants: null
        },
        sleg: {
            message: {
                br: [
                    "cera"
                ]
            },
            examples: [],
            variants: null
        },
        smug: {
            message: {
                br: [
                    "cigarro"
                ]
            },
            examples: [],
            variants: null
        },
        snop: {
            message: {
                br: [
                    "jamais",
                    "nunca"
                ]
            },
            examples: [],
            variants: null
        },
        snuz: {
            message: {
                br: [
                    "cama"
                ]
            },
            examples: [],
            variants: null
        },
        sofy: {
            message: {
                br: [
                    "filosofia",
                    "filósofo"
                ]
            },
            examples: [],
            variants: null
        },
        spet: {
            message: {
                br: [
                    "sombra"
                ]
            },
            examples: [],
            variants: null
        },
        spot: {
            message: {
                br: [
                    "sempre"
                ]
            },
            examples: [],
            variants: null
        },
        srag: {
            message: {
                br: [
                    "frango"
                ]
            },
            examples: [],
            variants: null
        },
        srak: {
            message: {
                br: [
                    "dada"
                ]
            },
            examples: [],
            variants: null
        },
        sret: {
            message: {
                br: [
                    "faxina"
                ]
            },
            examples: [],
            variants: null
        },
        stor: {
            message: {
                br: [
                    "host"
                ]
            },
            examples: [],
            variants: null
        },
        sufe: {
            message: {
                br: [
                    "sete"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        suft: {
            message: {
                br: [
                    "suco"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        sulu: {
            message: {
                br: [
                    "diferente"
                ]
            },
            examples: [],
            variants: null
        },
        sute: {
            message: {
                br: [
                    "seis"
                ]
            },
            examples: [],
            variants: null
        },
        swag: {
            message: {
                br: [
                    "servidor"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null,
            replacements: [
                "grah"
            ]
        },
        swen: {
            message: {
                br: [
                    "preguiçoso"
                ]
            },
            examples: [],
            variants: null
        },
        swyn: {
            message: {
                br: [
                    "forma"
                ]
            },
            examples: [],
            variants: null
        },
        tahi: {
            message: {
                br: [
                    "resposta",
                    "solução"
                ]
            },
            examples: [],
            variants: null
        },
        tart: {
            message: {
                br: [
                    "estalactite"
                ]
            },
            examples: [],
            variants: null
        },
        taek: {
            message: {
                br: [
                    "estado"
                ]
            },
            examples: [],
            variants: null
        },
        tdod: {
            message: {
                br: [
                    "tomate"
                ]
            },
            examples: [],
            variants: null
        },
        teak: {
            message: {
                br: [
                    "rico",
                    "riqueza"
                ]
            },
            examples: [],
            variants: null
        },
        tofh: {
            message: {
                br: [
                    "irmão",
                    "irmã"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        tops: {
            message: {
                br: [
                    "vez"
                ]
            },
            examples: [],
            variants: null
        },
        topt: {
            message: {
                br: [
                    "divertido",
                    "legal"
                ]
            },
            examples: [],
            variants: null
        },
        topk: {
            message: {
                br: [
                    "chata",
                    "chato"
                ]
            },
            examples: [],
            variants: null
        },
        tort: {
            message: {
                br: [
                    "hoje"
                ]
            },
            examples: [],
            variants: null
        },
        totr: {
            message: {
                br: [
                    "amanhã"
                ]
            },
            examples: [],
            variants: null
        },
        tpos: {
            message: {
                br: [
                    "raramente"
                ]
            },
            examples: [],
            variants: null
        },
        trar: {
            message: {
                br: [
                    "estalagmite"
                ]
            },
            examples: [],
            variants: null
        },
        trat: {
            message: {
                br: [
                    "eletricidade",
                    "elétrico"
                ]
            },
            examples: [],
            variants: null
        },
        trie: {
            message: {
                br: [
                    "século"
                ]
            },
            examples: [],
            variants: null
        },
        trir: {
            message: {
                br: [
                    "dia"
                ]
            },
            examples: [],
            variants: null
        },
        troa: {
            message: {
                br: [
                    "morno"
                ]
            },
            examples: [],
            variants: null
        },
        troe: {
            message: {
                br: [
                    "três"
                ]
            },
            examples: [],
            variants: null
        },
        trot: {
            message: {
                br: [
                    "ontem"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        true: {
            message: {
                br: [
                    "forte"
                ]
            },
            examples: [],
            variants: null
        },
        trui: {
            message: {
                br: [
                    "computador"
                ]
            },
            examples: [],
            variants: null
        },
        trur: {
            message: {
                br: [
                    "lado"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        trut: {
            message: {
                br: [
                    "esquerda",
                    "esquerdo"
                ]
            },
            examples: [],
            variants: null
        },
        turt: {
            message: {
                br: [
                    "direita",
                    "direito"
                ]
            },
            examples: [],
            variants: null
        },
        tute: {
            message: {
                br: [
                    "cérebro"
                ]
            },
            examples: [],
            variants: null
        },
        tuti: {
            message: {
                br: [
                    "amigo"
                ]
            },
            examples: [],
            variants: null
        },
        tyrr: {
            message: {
                br: [
                    "hora",
                    "momento"
                ]
            },
            examples: [],
            variants: null
        },
        uadu: {
            message: {
                br: [
                    "junto",
                    "unido"
                ]
            },
            examples: [],
            variants: null
        },
        uhfu: {
            message: {
                br: [
                    "joelho"
                ]
            },
            examples: [],
            variants: null
        },
        uhle: {
            message: {
                br: [
                    "apoio (moral ou material)",
                    "suporte"
                ]
            },
            examples: [],
            variants: null
        },
        uhly: {
            message: {
                br: [
                    "mesa"
                ]
            },
            examples: [],
            variants: null
        },
        uhno: {
            message: {
                br: [
                    "estômago"
                ]
            },
            examples: [],
            variants: null
        },
        uhpe: {
            message: {
                br: [
                    "baleia"
                ]
            },
            examples: [],
            variants: null
        },
        uhso: {
            message: {
                br: [
                    "zero"
                ]
            },
            examples: [],
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
            examples: [],
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
            examples: [],
            variants: null
        },
        ulus: {
            message: {
                br: [
                    "igual"
                ]
            },
            examples: [],
            variants: null
        },
        unmu: {
            message: {
                br: [
                    "mão"
                ]
            },
            examples: [],
            variants: null
        },
        uolo: {
            message: {
                br: [
                    "arroz"
                ]
            },
            examples: [],
            variants: null
        },
        urno: {
            message: {
                br: [
                    "intestino"
                ]
            },
            examples: [],
            variants: null
        },
        uviu: {
            message: {
                br: [
                    "peixe"
                ]
            },
            examples: [],
            variants: null
        },
        varu: {
            message: {
                br: [
                    "lobo"
                ]
            },
            examples: [],
            variants: null
        },
        valk: {
            message: {
                br: [
                    "queijo"
                ]
            },
            examples: [],
            variants: null
        },
        vest: {
            message: {
                br: [
                    "leite "
                ]
            },
            examples: [],
            variants: null
        },
        waag: {
            message: {
                br: [
                    "louça"
                ]
            },
            examples: [],
            variants: null
        },
        waki: {
            message: {
                br: [
                    "adolescente",
                    "jovem"
                ]
            },
            examples: [],
            variants: null
        },
        wala: {
            message: {
                br: [
                    "palavra"
                ]
            },
            examples: [],
            variants: null
        },
        wany: {
            message: {
                br: [
                    "criança"
                ]
            },
            examples: [],
            variants: null
        },
        warq: {
            message: {
                br: [
                    "dedo"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        woka: {
            message: {
                br: [
                    "outro"
                ]
            },
            examples: [],
            variants: null
        },
        wuag: {
            message: {
                br: [
                    "aula"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        wuhp: {
            message: {
                br: [
                    "super"
                ]
            },
            examples: [],
            variants: null
        },
        wuje: {
            message: {
                br: [
                    "quem"
                ]
            },
            examples: [],
            variants: null
        },
        wuky: {
            message: {
                br: [
                    "adolescência"
                ]
            },
            examples: [],
            variants: null
        },
        wune: {
            message: {
                br: [
                    "onde"
                ]
            },
            examples: [],
            variants: null
        },
        wuni: {
            message: {
                br: [
                    "infância"
                ]
            },
            examples: [],
            variants: null
        },
        wupe: {
            message: {
                br: [
                    "qual"
                ]
            },
            examples: [],
            variants: null
        },
        wuqa: {
            message: {
                br: [
                    "pergunta"
                ]
            },
            examples: [],
            variants: null
        },
        wuqe: {
            message: {
                br: [
                    "aleatório",
                    "qualquer"
                ]
            },
            examples: [],
            variants: null
        },
        wush: {
            message: {
                br: [
                    "academia"
                ]
            },
            examples: [],
            variants: null
        },
        wusu: {
            message: {
                br: [
                    "relação"
                ]
            },
            examples: [],
            variants: null
        },
        wuyh: {
            message: {
                br: [
                    "extremo",
                    "intensivo"
                ]
            },
            examples: [],
            variants: null
        },
        yair: {
            message: {
                br: [
                    "família"
                ]
            },
            examples: [],
            variants: null
        },
        yaye: {
            message: {
                br: [
                    "água "
                ]
            },
            examples: [],
            variants: null
        },
        yayu: {
            message: {
                br: [
                    "vida"
                ]
            },
            examples: [],
            variants: null
        },
        yela: {
            message: {
                br: [
                    "laranja"
                ]
            },
            examples: [],
            variants: null
        },
        yelo: {
            message: {
                br: [
                    "marrom"
                ]
            },
            examples: [],
            variants: null
        },
        yemo: {
            message: {
                br: [
                    "memória"
                ]
            },
            examples: [],
            variants: null
        },
        yepo: {
            message: {
                br: [
                    "verde"
                ]
            },
            examples: [],
            variants: null
        },
        yeur: {
            message: {
                br: [
                    "inscrito"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        yloy: {
            message: {
                br: [
                    "cenoura"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        ymer: {
            message: {
                br: [
                    "vídeo"
                ]
            },
            examples: [],
            variants: null
        },
        yohu: {
            message: {
                br: [
                    "baú",
                    "caixa"
                ]
            },
            examples: [],
            variants: null
        },
        yoio: {
            message: {
                br: [
                    "roxo"
                ]
            },
            examples: [],
            variants: null
        },
        yoiu: {
            message: {
                br: [
                    "vermelho"
                ]
            },
            examples: [],
            variants: null
        },
        yolo: {
            message: {
                br: [
                    "azul"
                ]
            },
            examples: [],
            variants: null
        },
        yomu: {
            message: {
                br: [
                    "cartão"
                ]
            },
            examples: [],
            variants: null
        },
        yopo: {
            message: {
                br: [
                    "turquesa"
                ]
            },
            examples: [],
            variants: null
        },
        yopu: {
            message: {
                br: [
                    "dourado"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        youo: {
            message: {
                br: [
                    "bege"
                ]
            },
            examples: [],
            variants: null
        },
        youp: {
            message: {
                br: [
                    "prata"
                ]
            },
            examples: [],
            variants: null
        },
        yout: {
            message: {
                br: [
                    "jeito"
                ]
            },
            examples: [],
            variants: null
        },
        yoyo: {
            message: {
                br: [
                    "aparelho"
                ]
            },
            examples: [],
            variants: null
        },
        yoyu: {
            message: {
                br: [
                    "celular",
                    "telefone"
                ]
            },
            examples: [],
            variants: null
        },
        yrui: {
            message: {
                br: [
                    "sono"
                ]
            },
            examples: [],
            variants: null
        },
        yryr: {
            message: {
                br: [
                    "alienígena",
                    "invasor"
                ]
            },
            examples: [],
            variants: null
        },
        ytre: {
            message: {
                br: [
                    "bissexto"
                ]
            },
            examples: [],
            variants: null
        },
        ytyr: {
            message: {
                br: [
                    "fim"
                ]
            },
            examples: [],
            variants: null
        },
        yuiu: {
            message: {
                br: [
                    "amarelo"
                ]
            },
            examples: [],
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
            examples: [],
            variants: null
        },
        yuno: {
            message: {
                br: [
                    "braço"
                ]
            },
            examples: [],
            variants: null
        },
        yupo: {
            message: {
                br: [
                    "moreno"
                ]
            },
            examples: [],
            variants: null
        },
        yuuh: {
            message: {
                br: [
                    "cinza"
                ]
            },
            examples: [],
            variants: null
        },
        zuyh: {
            message: {
                br: [
                    "sentido"
                ]
            },
            examples: [],
            variants: null
        },
        zold: {
            message: {
                br: [
                    "velocidade",
                    "velocímetro"
                ]
            },
            examples: [],
            variants: null
        },
        yort: {
            message: {
                br: [
                    "rosa"
                ]
            },
            examples: [],
            variants: null
        },
        yopy: {
            message: {
                br: [
                    "foca"
                ]
            },
            examples: [],
            variants: null
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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
            examples: [],
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