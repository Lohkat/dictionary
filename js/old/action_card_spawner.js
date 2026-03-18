/* 
Object:
{
    key: <word that matched>
    old_or_replacement: <boolean>
    src: { << base object
        <base_key>: {
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
    }
}
*/
function make_action_card(src, is_match) {
    const key = Object.keys(src)[0];
    const vals = src[key];

    const message = vals[lang_sel]?.message; // always exist
    const old_message = vals[lang_sel]?.old_message;

    const variants = vals.variants?.[lang_sel];
    const old_variants = vals.old_variants?.[lang_sel];

    const examples = vals.examples; // [ { phrase: <>, message: { <LANG>: [ "meanings", ... ] }, ... ]

    const obsolete = vals.obsolete === true;

    const replacements = vals.replacements;

    const root =  document.createElement("div");
    const title = document.createElement("span");
    const buttons = document.createElement("div");
    const detail = document.createElement("div");

    root.classList.add("action-card");
    if (is_match !== true) root.classList.add("minimalist");

    title.classList.add("title");

    buttons.classList.add("buttons");

    detail.classList.add("detail");

    title.textContent = key;

    for(let i = 0; i < 6; ++i) buttons.appendChild(document.createElement("button"));
    buttons.children[0].setAttribute("transl_en", "translations");
    buttons.children[0].setAttribute("transl_br", "traduções");
    buttons.children[0].textContent = "📗";

    buttons.children[1].setAttribute("transl_en", "examples");
    buttons.children[1].setAttribute("transl_br", "exemplos");
    buttons.children[1].textContent = "📖";

    buttons.children[2].setAttribute("transl_en", "old translations");
    buttons.children[2].setAttribute("transl_br", "traduções antigas");
    buttons.children[2].textContent = "📕";

    buttons.children[3].setAttribute("transl_en", "variations");
    buttons.children[3].setAttribute("transl_br", "variações");
    buttons.children[3].textContent = "🌟";

    buttons.children[4].setAttribute("transl_en", "old variations");
    buttons.children[4].setAttribute("transl_br", "variações antigas");
    buttons.children[4].textContent = "⭐";

    buttons.children[5].setAttribute("transl_en", "replaced by");
    buttons.children[5].setAttribute("transl_br", "substituído por");
    buttons.children[5].textContent = "🔄";

    root.appendChild(title);
    root.appendChild(buttons);
    root.appendChild(detail);
    
    return root;
}