// Larinuim dictionary in array/objectified way

function count_string_match(str1, str2)
{
    let i = 0;
    if (str1 === str2) return 1000;
    while(i < str1.length && i < str2.length && str1[i] === str2[i]) ++i;
    return i;
}

function larinuim_FIND_ANY(word) {
    if (word.startsWith("exact:")){
        return larinuim_FIND_WORD(word.substring(("exact:").length));
    }

    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        if (obj.l.indexOf(word) != -1) {
            opts[opts.length] = {
                o: obj,
                w: (-10 - count_string_match(obj.l, word))
            };
        }
        else {
            let found = false;
            for(let j = 0; j < obj.d.length; ++j) {
                if (obj.d[j].indexOf(word) >= 0) {
                    opts[opts.length] = { 
                        o: __dict[i],
                        w: (10 - 2 * count_string_match(obj.d[j], word)) + (obj["discontinued"] === true ? 1000 : 0)
                    };
                    found = true;
                    break;
                }
            }
            if (!found) {                
                for(let j = 0; obj["e"] != null && j < obj.e.length; ++j) {
                    if (obj.e[j][0].indexOf(word) >= 0) {
                        opts[opts.length] = { 
                            o: __dict[i],
                            w: (30 - 6 * count_string_match(obj.e[j][0], word)) + (obj["discontinued"] === true ? 1000 : 0)
                        };
                        break;
                    }
                    if (obj.e[j][1].indexOf(word) >= 0) {
                        opts[opts.length] = { 
                            o: __dict[i],
                            w: (30 - 6 * count_string_match(obj.e[j][1], word)) + (obj["discontinued"] === true ? 1000 : 0)
                        };
                        break;
                    }
                }
            }
        }
    }
    let res = [];
    opts.sort(function(a,b){return a.w - b.w;});
    for(let i = 0; i < opts.length; ++i) res[i] = opts[i].o;

    return res;
}

function larinuim_FIND_WORD(word) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        if (obj.l.indexOf(word) != -1) opts[opts.length] = obj;
    }
    return opts;
}

function larinuim_FIND_REVERSE(revs) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        for(let j = 0; j < obj.d.length; ++j) {
            if (obj.d[j].indexOf(revs) >= 0) {
                opts[opts.length] = obj;
                break;
            }
        }
    }
    return opts;
}

function larinuim_LENGTH() {
    return __dict.length;
}

function larinuim_INDEX(index) {
    if (index >= __dict.length) return null;
    return __dict[index];
}

function larinuim_REMOVE_MODS(word) {
    // all modifiers have 2 extra before or after!
    // all cases it is at least 5 characters long.
    
    let l_word = word.toLowerCase();

    if (word.length < 5) {
        return { l: l_word, msg: []};
    }
    
    // there's no need to "for iterate" the modifiers if there are only 2. It is verb or common word.
    let res = { l: l_word, msg: [] };

    let dct = null;

    if (l_word.length % 2 === 1) { // verb
        dct = __dict_modifiers[1];
    }
    else { // common word
        dct = __dict_modifiers[0];
    }

    let already_done = [];
    
    for(let i = 0; i < dct.cases_before.length; ++i) {
        if (already_done.indexOf(i) != -1) continue;

        const obj = dct.cases_before[i];

        if (l_word.startsWith(obj.l)) {
            l_word = l_word.substring(obj.l.length);
            res.msg[res.msg.length] = [obj.l, obj.m];
            already_done[already_done.length] = i;
            i = -1;
        }
    }

    already_done = [];

    for(let i = 0; i < dct.cases_after.length; ++i) {
        if (already_done.indexOf(i) != -1) continue;

        const obj = dct.cases_after[i];
        
        if (l_word.endsWith(obj.l)) {
            l_word = l_word.substring(0, l_word.length - obj.l.length);
            res.msg[res.msg.length] = [obj.l, obj.m];
            already_done[already_done.length] = i;
            i = -1;
        }
    }

    res.l = l_word;
    return res;
}


const __dict_modifiers = [
    {
        //when: 4, // words
        cases_before: [
            { l: 'ni', m: 'sexo feminino' },
            { l: 'na', m: 'sexo masculino' }
        ],
        cases_after: [
            { l: 'xi', m: 'diminutivo' },
            { l: 'xa', m: 'aumentativo' }
        ]
    },
    {
        //when: 3, // verb
        cases_before: [
            { l: 'ue', m: 'eu' },
            { l: 'ae', m: 'você (com quem estou falando, próximo, ao meu lado)' },
            { l: 'pe', m: 'ele/você (externo, ou chamando distante, longe)' },
            { l: 'ua', m: 'nós (todos os aplicáveis)' },
            { l: 'sa', m: 'nós (orador e sua turma ou grupo dirigindo-se a outro grupo não incluído)' },
            { l: 'va', m: 'vocês (próximos num raio pequeno, inclusivo)' },
            { l: 'ka', m: 'eles (externo ou distante)' }
        ],
        cases_after: [
            { l: 'pa', m: 'passado' },
            { l: 'fa', m: 'futuro' },
            { l: 'ga', m: 'gerúndio' },
            { l: 'ku', m: 'substantivado' },
            { l: 'xi', m: 'diminutivo' },
            { l: 'xa', m: 'aumentativo' }
        ]
    }

];




const __dict =
[
 {
  l: "ae",
  d: [
   "você",
   "ele",
   "sujeito"
  ],
  e: [
    ["ae tue gatx","você é bonito"],
    ["ae pod jap", "ele pode voar"]
  ]
 },
 {
  l: "ai",
  d: [
   "isso",
   "isto"
  ],
  e: [
    ["ai tue topt","isso é divertido"],
    ["maol ai tuepa wafku","então isso foi concluído"]
  ]
 },
 {
  l: "as",
  d: [
   "vosso",
   "vossa"
  ],
  e: [
    ["as kjor, ueqne kik","vossa senhoria, desejo dormir"]
  ]
 },
 {
  l: "au",
  d: [
   "nosso",
   "nossa"
  ],
  e: [
    ["au brad lol tohd etit","nosso pão de cada dia"]
  ]
 },
 {
  l: "av",
  d: [
   "seu",
   "sua",
   "seus",
   "suas"
  ]
 },
 {
  l: "ea",
  d: [
   "seu",
   "sua"
  ]
 },
 {
  l: "es",
  d: [
   "teu",
   "tua"
  ]
 },
 {
  l: "eu",
  d: [
   "meu",
   "minha"
  ]
 },
 {
  l: "sa",
  d: [
   "vós"
  ]
 },
 {
  l: "se",
  d: [
   "tu"
  ]
 },
 {
  l: "ua",
  d: [
   "nós"
  ]
 },
 {
  l: "ue",
  d: [
   "eu"
  ]
 },
 {
  l: "va",
  d: [
   "eles",
   "vocês"
  ]
 },
 {
  l: "wa",
  d: [
   "aquilo"
  ]
 },
 {
  l: "abd",
  d: [
   "aprender"
  ]
 },
 {
  l: "abl",
  d: [
   "acontecer",
   "preparar",
   "gerar",
   "produzir",
   "ajustar",
   "prontificar",
   "existir"
  ]
 },
 {
  l: "adi",
  d: [
   "conhecer",
   "descobrir",
   "inventar",
   "desabrochar"
  ]
 },
 {
  l: "aka",
  d: [
   "arrumar",
   "organizar",
   "otimizar",
   "conseguir"
  ]
 },
 {
  l: "ale",
  d: [
   "escovar",
   "pentear",
   "acariciar",
   "tocar",
   "aconchegar",
   "abraçar",
   "desculpar"
  ]
 },
 {
  l: "alg",
  d: [
   "almoçar",
   "lanchar",
   "entupir",
   "pintar",
   "pincelar",
   "comer",
   "preencher"
  ]
 },
 {
  l: "awf",
  d: [
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
 {
  l: "bak",
  d: [
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
 {
  l: "bal",
  d: [
   "carregar",
   "transportar",
   "recarregar",
   "obter",
   "receber",
   "informar",
   "ler"
  ]
 },
 {
  l: "bih",
  d: [
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
 {
  l: "bla",
  d: [
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
 {
  l: "bly",
  d: [
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
 {
  l: "bty",
  d: [
   "comprar",
   "mercar",
   "adquirir",
   "obter"
  ]
 },
 {
  l: "byh",
  d: [
   "chover",
   "molhar",
   "lavar",
   "limpar",
   "banhar",
   "lavar",
   "limpar"
  ]
 },
 {
  l: "cla",
  d: [
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
 {
  l: "cra",
  d: [
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
 {
  l: "cro",
  d: [
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
 {
  l: "cto",
  d: [
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
 {
  l: "dak",
  d: [
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
 {
  l: "dap",
  d: [
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
 {
  l: "dec",
  d: [
   "achar",
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
   "pensar"
  ]
 },
 {
  l: "dee",
  d: [
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
 {
  l: "def",
  d: [
   "criar",
   "inovar",
   "transformar",
   "converter",
   "cuidar",
   "atentar",
   "zelar"
  ]
 },
 {
  l: "dek",
  d: [
   "ensinar",
   "mostrar",
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
 {
  l: "des",
  d: [
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
 {
  l: "dla",
  d: [
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
 {
  l: "dos",
  d: [
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
   "precaver",
  ]
 },
 {
  l: "duh",
  d: [
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
 {
  l: "dwa",
  d: [
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
 {
  l: "dyd",
  d: [
   "duvidar",
   "perguntar",
   "questionar",
   "hesitar",
   "flutuar",
   "oscilar",
   "indagar",
   "interrogar",
   "sindicar"
  ]
 },
 {
  l: "ena",
  d: [
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
 {
  l: "ene",
  d: [
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
 {
  l: "eny",
  d: [
   "energizar",
   "ligar",
   "levantar",
   "subir",
   "empoderar",
   "conectar",
   "plugar",
   "inserir",
   "alimentar",
   "engravidar",
   "revidar",
   "bater",
   "golpear"
  ]
 },
 {
  l: "epy",
  d: [
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
 {
  l: "esy",
  d: [
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
 {
  l: "ety",
  d: [
   "afastar",
   "distanciar",
   "separar",
   "desconectar",
   "desplugar",
   "terminar",
   "abortar",
   "analisar",
   "desdobrar",
   "decifrar",
   "combater",
   "relaxar",
   "descansar"
  ]
 },
 {
  l: "faq",
  d: [
   "levar",
   "transportar",
   "carregar",
   "enviar",
   "transferir",
   "promover",
   "movimentar"
  ]
 },
 {
  l: "fla",
  d: [
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
 {
  l: "fle",
  d: [
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
 {
  l: "flo",
  d: [
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
 {
  l: "fti",
  d: [
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
 {
  l: "fur",
  d: [
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
 {
  l: "fyl",
  d: [
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
 { // ######## stopped here ################
  l: "gaq",
  d: [
   "conduzir",
   "guiar",
   "seguir",
   "trilhar",
   "inscrever",
   "assinar",
   "caminhar"
  ]
 },
 {
  l: "gds",
  d: [
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
 {
  l: "gku",
  d: [
   "preocupar",
   "assustar",
   "destacar",
   "aparecer",
   "destacar",
   "fixar",
   "focar",
   "tachar"
  ]
 },
 {
  l: "gno",
  d: [
   "ir",
   "passar",
   "expirar",
   "perecer",
   "acabar",
   "terminar",
   "finalizar"
  ]
 },
 {
  l: "gto",
  d: [
   "gostar",
   "apreciar"
  ]
 },
 {
  l: "guk",
  d: [
   "subir"
  ]
 },
 {
  l: "hug",
  d: [
   "avisar"
  ]
 },
 {
  l: "hyc",
  d: [
   "enxergar",
   "olhar",
   "ver"
  ]
 },
 {
  l: "hye",
  d: [
   "verificar"
  ]
 },
 {
  l: "hyi",
  d: [
   "esconder",
   "desaparecer",
   "sumir"
  ]
 },
 {
  l: "ihk",
  d: [
   "adorar"
  ]
 },
 {
  l: "ike",
  d: [
   "dever"
  ]
 },
 {
  l: "iki",
  d: [
   "merecer"
  ]
 },
 {
  l: "ikk",
  d: [
   "atrapalhar"
  ]
 },
 {
  l: "jap",
  d: [
   "voar",
   "flutuar",
   "planar"
  ]
 },
 {
  l: "jip",
  d: [
   "beijar"
  ]
 },
 {
  l: "jki",
  d: [
   "lavar"
  ]
 },
 {
  l: "jol",
  d: [
   "bater",
   "golpear"
  ]
 },
 {
  l: "kaa",
  d: [
   "exigir",
   "invocar"
  ]
 },
 {
  l: "kei",
  d: [
   "encher",
   "servir"
  ]
 },
 {
  l: "kek",
  d: [
   "desapontar"
  ]
 },
 {
  l: "kgo",
  d: [
   "libertar"
  ]
 },
 {
  l: "kik",
  d: [
   "dormir"
  ]
 },
 {
  l: "kok",
  d: [
   "veja"
  ]
 },
 {
  l: "kop",
  d: [
   "colaborar",
   "participar"
  ]
 },
 {
  l: "koy",
  d: [
   "amassar",
   "amocar"
  ]
 },
 {
  l: "krk",
  d: [
   "atualizar"
  ]
 },
 {
  l: "kro",
  d: [
   "fazer"
  ]
 },
 {
  l: "lak",
  d: [
   "abaixar"
  ]
 },
 {
  l: "laq",
  d: [
   "baixar",
   "puxar",
   "trazer"
  ]
 },
 {
  l: "lar",
  d: [
   "trabalhar",
   "desenvolver",
   "manusear"
  ]
 },
 {
  l: "lay",
  d: [
   "escutar",
   "ouvir"
  ]
 },
 {
  l: "laz",
  d: [
   "iluminar"
  ]
 },
 {
  l: "lea",
  d: [
   "parar"
  ]
 },
 {
  l: "leh",
  d: [
   "adivinhar"
  ]
 },
 {
  l: "lep",
  d: [
   "brincar"
  ]
 },
 {
  l: "lii",
  d: [
   "sorrir"
  ]
 },
 {
  l: "lio",
  d: [
   "entender"
  ]
 },
 {
  l: "lod",
  d: [
   "estudar"
  ]
 },
 {
  l: "lof",
  d: [
   "odiar"
  ]
 },
 {
  l: "log",
  d: [
   "chutar"
  ]
 },
 {
  l: "lot",
  d: [
   "perder",
   "tirar",
   "roubar"
  ]
 },
 {
  l: "lra",
  d: [
   "cantar"
  ]
 },
 {
  l: "lui",
  d: [
   "existir",
   "haver"
  ]
 },
 {
  l: "luk",
  d: [
   "fumar"
  ]
 },
 {
  l: "lur",
  d: [
   "acertar"
  ]
 },
 {
  l: "lyr",
  d: [
   "errar",
   "falhar",
   "fracassar"
  ]
 },
 {
  l: "mig",
  d: [
   "contar",
   "fatiar",
   "distribuir"
  ]
 },
 {
  l: "nag",
  d: [
   "estressar"
  ]
 },
 {
  l: "nak",
  d: [
   "cochilar"
  ]
 },
 {
  l: "naq",
  d: [
   "escolher",
   "selecionar",
   "preferir"
  ]
 },
 {
  l: "naz",
  d: [
   "descansar"
  ]
 },
 {
  l: "neh",
  d: [
   "nascer"
  ]
 },
 {
  l: "nhu",
  d: [
   "alterar",
   "modificar",
   "mudar"
  ]
 },
 {
  l: "nih",
  d: [
   "renascer"
  ]
 },
 {
  l: "nog",
  d: [
   "chegar",
   "vir"
  ]
 },
 {
  l: "obs",
  d: [
   "observar"
  ]
 },
 {
  l: "ofi",
  d: [
   "trepar"
  ]
 },
 {
  l: "oky",
  d: [
   "agradecer"
  ]
 },
 {
  l: "ole",
  d: [
   "apagar"
  ]
 },
 {
  l: "olf",
  d: [
   "remover"
  ]
 },
 {
  l: "olg",
  d: [
   "acabar"
  ]
 },
 {
  l: "oli",
  d: [
   "dar"
  ]
 },
 {
  l: "olk",
  d: [
   "adiar"
  ]
 },
 {
  l: "ori",
  d: [
   "fechar"
  ]
 },
 {
  l: "par",
  d: [
   "enfiar"
  ]
 },
 {
  l: "pie",
  d: [
   "viajar"
  ]
 },
 {
  l: "pka",
  d: [
   "sapatear"
  ]
 },
 {
  l: "plk",
  d: [
   "responder"
  ]
 },
 {
  l: "plo",
  d: [
   "abrir"
  ]
 },
 {
  l: "pod",
  d: [
   "poder"
  ]
 },
 {
  l: "pop",
  d: [
   "continuar",
   "seguir",
   "prosseguir"
  ]
 },
 {
  l: "pra",
  d: [
   "escutar"
  ]
 },
 {
  l: "pre",
  d: [
   "assinar",
   "declarar"
  ]
 },
 {
  l: "pri",
  d: [
   "entrar",
   "visitar"
  ]
 },
 {
  l: "qne",
  d: [
   "desejar",
   "pedir",
   "querer"
  ]
 },
 {
  l: "qnm",
  d: [
   "salvar"
  ]
 },
 {
  l: "rai",
  d: [
   "chamar",
   "ligar",
   "telefonar"
  ]
 },
 {
  l: "rau",
  d: [
   "imaginar",
   "pensar",
   "sonhar"
  ]
 },
 {
  l: "reh",
  d: [
   "pagar"
  ]
 },
 {
  l: "rka",
  d: [
   "gravar"
  ]
 },
 {
  l: "rud",
  d: [
   "prestar"
  ]
 },
 {
  l: "ruh",
  d: [
   "sair"
  ]
 },
 {
  l: "rye",
  d: [
   "enviar",
   "escrever"
  ]
 },
 {
  l: "ryi",
  d: [
   "passar"
  ]
 },
 {
  l: "saa",
  d: [
   "prometer"
  ]
 },
 {
  l: "saf",
  d: [
   "abusar"
  ]
 },
 {
  l: "sak",
  d: [
   "faltar"
  ]
 },
 {
  l: "sea",
  d: [
   "comprometer"
  ]
 },
 {
  l: "sek",
  d: [
   "colocar",
   "por"
  ]
 },
 {
  l: "sem",
  d: [
   "deixar"
  ]
 },
 {
  l: "sfy",
  d: [
   "filosofar"
  ]
 },
 {
  l: "sih",
  d: [
   "começar",
   "iniciar",
   "jogar"
  ]
 },
 {
  l: "ska",
  d: [
   "dançar"
  ]
 },
 {
  l: "sle",
  d: [
   "faxinar"
  ]
 },
 {
  l: "squ",
  d: [
   "monitorar"
  ]
 },
 {
  l: "sru",
  d: [
   "tentar"
  ]
 },
 {
  l: "sue",
  d: [
   "abraçar"
  ]
 },
 {
  l: "suk",
  d: [
   "editar"
  ]
 },
 {
  l: "swa",
  d: [
   "pirar"
  ]
 },
 {
  l: "swi",
  d: [
   "voltar",
   "desfazer"
  ]
 },
 {
  l: "tar",
  d: [
   "ter"
  ]
 },
 {
  l: "tbd",
  d: [
   "melhorar",
   "sarar",
   "revigorar",
   "recuperar",
   "restaurar",
   "resistir"
  ]
 },
 {
  l: "tnu",
  d: [
   "sobreviver",
   "viver"
  ]
 },
 {
  l: "tol",
  d: [
   "ganhar",
   "vencer"
  ]
 },
 {
  l: "top",
  d: [
   "ficar"
  ]
 },
 {
  l: "tra",
  d: [
   "importar"
  ]
 },
 {
  l: "tre",
  d: [
   "aceitar"
  ]
 },
 {
  l: "tua",
  d: [
   "socializar"
  ]
 },
 {
  l: "tue",
  d: [
   "estar",
   "ser"
  ]
 },
 {
  l: "tyh",
  d: [
   "cuidar"
  ]
 },
 {
  l: "ugs",
  d: [
   "retornar",
   "voltar"
  ]
 },
 {
  l: "uhm",
  d: [
   "precisar"
  ]
 },
 {
  l: "uls",
  d: [
   "mandar",
   "obrigar"
  ]
 },
 {
  l: "ulu",
  d: [
   "dividir",
   "analisar"
  ]
 },
 {
  l: "uru",
  d: [
   "memorizar"
  ]
 },
 {
  l: "uwe",
  d: [
   "aguardar",
   "esperar"
  ]
 },
 {
  l: "uwo",
  d: [
   "cozinhar"
  ]
 },
 {
  l: "uyo",
  d: [
   "amar"
  ]
 },
 {
  l: "waa",
  d: [
   "ousar"
  ]
 },
 {
  l: "wab",
  d: [
   "trocar"
  ]
 },
 {
  l: "wae",
  d: [
   "correr",
   "avançar",
   "pular"
  ]
 },
 {
  l: "waf",
  d: [
   "concluir"
  ]
 },
 {
  l: "wah",
  d: [
   "andar"
  ]
 },
 {
  l: "wre",
  d: [
   "cercar"
  ]
 },
 {
  l: "wri",
  d: [
   "reclamar"
  ]
 },
 {
  l: "wug",
  d: [
   "cansar"
  ]
 },
 {
  l: "wum",
  d: [
   "acordar"
  ]
 },
 {
  l: "wyt",
  d: [
   "cortar",
   "machucar"
  ]
 },
 {
  l: "xur",
  d: [
   "atender"
  ]
 },
 {
  l: "yaa",
  d: [
   "significar",
   "valer"
  ]
 },
 {
  l: "yhe",
  d: [
   "esquecer"
  ]
 },
 {
  l: "yio",
  d: [
   "abandonar"
  ]
 },
 {
  l: "yte",
  d: [
   "aproximar"
  ]
 },
 {
  l: "zno",
  d: [
   "sentir"
  ]
 },
 {
  l: "zon",
  d: [
   "saber"
  ]
 },
 {
  l: "zuh",
  d: [
   "morrer"
  ]
 },
 {
  "discontinued": true,
  l: "wue",
  d: [
   "trocado para => koy"
  ]
 },
 {
  "discontinued": true,
  l: "dea",
  d: [
   "trocado para => dec",
   "achar"
  ]
 },
 {
  l: "anne",
  d: [
   "macaco"
  ]
 },
 {
  l: "abia",
  d: [
   "lama",
   "terra",
   "sujeira",
   "sujo"
  ]
 },
 {
  l: "aete",
  d: [
   "nome",
   "identificação",
   "palavra",
   "título"
  ]
 },
 {
  l: "afoh",
  d: [
   "cachorro",
   "cadela",
   "pet",
   "estimação",
   "subordinado",
   "dependente",
   "derivado",
   "originado"
  ]
 },
 {
  l: "ahly",
  d: [
   "ilha",
   "monte",
   "círculo",
   "área"
  ]
 },
 {
  l: "alfk",
  d: [
   "dom",
   "habilidade"
  ]
 },
 {
  l: "alul",
  d: [
   "cavalo",
   "égua"
  ]
 },
 {
  l: "amya",
  d: [
   "tanto",
   "tantos",
   "tantas",
   "tão"
  ]
 },
 {
  l: "anoa",
  d: [
   "sol",
   "fogo",
   "quente",
   "fonte",
   "fogueira",
   "centro",
   "origem",
   "verão",
   "destaque",
   "destacado",
   "foco",
   "ponto",
   "argumento"
  ]
 },
 {
  l: "aout",
  d: [
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
 {
  l: "asse",
  d: [
   "possível",
   "provável",
   "possibilidade",
   "chance",
   "oportunidade"
  ]
 },
 {
  l: "aved",
  d: [
   "talvez"
  ]
 },
 {
  l: "awfo",
  d: [
   "recuperação",
   "conserto",
   "correção"
  ]
 },
 {
  l: "bduh",
  d: [
   "bobo",
   "palhaço",
   "animador",
   "humorista"
  ]
 },
 {
  l: "bite",
  d: [
   "ano",
   "luz",
   "luminosidade",
   "energia"
  ]
 },
 {
  l: "blar",
  d: [
   "conversa",
   "papo",
   "mensagem",
   "comentário"
  ]
 },
 {
  l: "body",
  d: [
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
 {
  l: "bofo",
  d: [
   "brócolis"
  ]
 },
 {
  l: "brad",
  d: [
   "pão",
   "massa"
  ]
 },
 {
  l: "brod",
  d: [
   "comida",
   "alimento",
   "refeição",
   "lanche",
   "piquenique",
   "remédio",
   "ingerível"
  ]
 },
 {
  l: "brot",
  d: [
   "boca",
   "orifício"
  ]
 },
 {
  l: "brum",
  d: [
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
 {
  l: "brus",
  d: [
   "ônibus",
   "transporte",
   "multidão",
   "conjunto",
   "grupo",
   "turma"
  ]
 },
 {
  l: "buno",
  d: [
   "traseira",
   "trás",
   "ânus"
  ]
 },
 {
  l: "bunt",
  d: [
   "mil",
   "multiplicador",
   "fator"
  ]
 },
 {
  l: "bvor",
  d: [
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
 {
  l: "carr",
  d: [
   "caro",
   "custoso",
   "cansativo",
   "demorado",
   "desgastante"
  ]
 },
 {
  l: "cite",
  d: [
   "cinco",
   "número cinco"
  ]
 },
 {
  l: "cloc",
  d: [
   "feijão",
   "borrado",
   "oblíquo",
   "esquecido",
   "confuso"
  ]
 },
 {
  l: "clon",
  d: [
   "com",
   "como"
  ]
 },
 {
  l: "colk",
  d: [
   "mistura",
   "prato",
   "feijoada"
  ]
 },
 {
  l: "coln",
  d: [
   "controle",
   "ferramenta",
   "controlador",
   "administrador"
  ]
 },
 {
  l: "crar",
  d: [
   "automotivo",
   "carro",
   "transporte",
   "meio",
   "ferramenta mecânica que ajuda no movimento de algo",
   "meio de transporte de um objeto ou ser vivo por algum meio mecânico"
  ]
 },
 {
  l: "cret",
  d: [
   "sobrancelha",
   "expressão",
   "algo que expresse sentimento ou emoção",
   "forma de dizer algo"
  ]
 },
 {
  l: "crue",
  d: [
   "burro",
   "burra",
   "jumento",
   "jumenta"
  ]
 },
 {
  l: "cruy",
  d: [
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
 {
  l: "cunk",
  d: [
   "milhão",
   "milésimo",
   "multiplicador"
  ]
 },
 {
  l: "daeh",
  d: [
   "colega",
   "membro",
   "participante de um grupo",
   "de uma turma",
   "conhecido amigável"
  ]
 },
 {
  l: "dayh",
  d: [
   "sócio",
   "membro de alta classe de um grupo",
   "dono",
   "criador",
   "mestre",
   "administração"
  ]
 },
 {
  l: "daew",
  d: [
   "externo",
   "fora",
   "vizinho",
   "estrangeiro",
   "desconhecido",
   "novo na área não conhecido pelo bairro",
   "importado"
  ]
 },
 {
  l: "dafk",
  d: [
   "cabeça",
   "parte superior",
   "controle",
   "cérebro",
   "aquele ou aquilo que controla ou direciona",
   "volante",
   "guidão"
  ]
 },
 {
  l: "daih",
  d: [
   "adulto",
   "maior de idade",
   "responsável",
   "para maior de idade",
   "inapropriado",
   "nsfw"
  ]
 },
 {
  l: "daiw",
  d: [
   "interno",
   "dentro",
   "exportado",
   "submerso",
   "debaixo de algo",
   "coberto",
   "profundo",
   "fundo",
   "bem abaixo",
   "detalhado profundamente",
   "bem feito",
   "perfeccionista",
   "perfeito",
   "perfeitamente feito",
   "bom trabalho"
  ]
 },
 {
  l: "daoh",
  d: [
   "idoso",
   "terceira idade",
   "algo que parece velho",
   "antigo",
   "antiguidade"
  ]
 },
 {
  l: "dapa",
  d: [
   "capaz",
   "ter a capacidade de",
   "que aguenta",
   "tem força para carregar",
   "forte",
   "competente"
  ]
 },
 {
  l: "deft",
  d: [
   "deficiente",
   "com falta de",
   "em falta",
   "terminou",
   "fim"
  ]
 },
 {
  l: "defy",
  d: [
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
 {
  l: "delf",
  d: [
   "fofo"
  ]
 },
 {
  l: "dept",
  d: [
   "depois",
   "após",
   "posterior"
  ]
 },
 {
  l: "dlet",
  d: [
   "principal",
   "que aparece primeiro",
   "se destaca ou é importante para o corpo ou objeto",
   "preciso",
   "necessário",
   "importante",
   "oficial",
   "genuíno"
  ]
 },
 {
  l: "doht",
  d: [
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
 {
  l: "dout",
  d: [
   "doutor",
   "pessoa com grande experiência em algo",
   "com ensino completo em algo",
   "doutorado"
  ]
 },
 {
  l: "dovk",
  d: [
   "modo",
   "meio",
   "forma de fazer"
  ]
 },
 {
  l: "drib",
  d: [
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
 {
  l: "dtie",
  d: [
   "digital",
   "geralmente não mecânico",
   "que funciona de forma digital"
  ]
 },
 {
  l: "dtye",
  d: [
   "futurista",
   "à frente",
   "adiantado"
  ]
 },
 {
  l: "dude",
  d: [
   "dois",
   "número dois"
  ]
 },
 {
  l: "dued",
  d: [
   "nota",
   "resultado",
   "valor"
  ]
 },
 {
  l: "duly",
  d: [
   "plural",
   "múltiplo"
  ]
 },
 {
  l: "duut",
  d: [
   "nádega",
   "bunda",
   "parte traseira",
   "que aparece por último"
  ]
 },
 {
  l: "dwat",
  d: [
   "secreto",
   "segredo",
   "protegido",
   "lacrado",
   "mantido fora do alcance"
  ]
 },
 {
  l: "edof",
  d: [
   "dinheiro",
   "moeda"
  ]
 },
 {
  l: "egka",
  d: [
   "ave",
   "pássaro",
   "algo que voe",
   "avião",
   "águia"
  ]
 },
 {
  l: "eitd",
  d: [
   "analógico",
   "mecânico",
   "natural"
  ]
 },
 {
  l: "elgh",
  d: [
   "duro",
   "rígido",
   "resistente",
   "egoísta"
  ]
 },
 {
  l: "enge",
  d: [
   "engenharia",
   "engenheiro"
  ]
 },
 {
  l: "esge",
  d: [
   "artista",
   "aquele que desenha",
   "cria arte",
   "criativo",
   "inovador",
   "que pensa fora da caixa"
  ]
 },
 {
  l: "esiu",
  d: [
   "difícil",
   "complicado",
   "fechado",
   "difícil acesso",
   "trancado"
  ]
 },
 {
  l: "esja",
  d: [
   "dificuldade",
   "resistência",
   "força contra",
   "defesa",
   "defensivo"
  ]
 },
 {
  l: "espa",
  d: [
   "pois",
   "por que",
   "porque",
   "por quê",
   "porquê"
  ]
 },
 {
  l: "espe",
  d: [
   "alface"
  ]
 },
 {
  l: "etit",
  d: [
   "data",
   "dia",
   "reserva",
   "encontro"
  ]
 },
 {
  l: "eurt",
  d: [
   "fraco",
   "frágil",
   "inseguro",
   "temporário",
   "alugado"
  ]
 },
 {
  l: "euyt",
  d: [
   "vacina",
   "cura",
   "seringa",
   "remédio",
   "drogas",
   "medicamento"
  ]
 },
 {
  l: "ewrk",
  d: [
   "borracha",
   "pneu"
  ]
 },
 {
  l: "fafa",
  d: [
   "minuto"
  ]
 },
 {
  l: "fafs",
  d: [
   "velho",
   "idoso",
   "antigo",
   "clássico"
  ]
 },
 {
  l: "fakk",
  d: [
   "obrigado",
   "agradecido",
   "agradecimento"
  ]
 },
 {
  l: "fein",
  d: [
   "combustível",
   "origem",
   "herança",
   "fonte",
   "pesquisa"
  ]
 },
 {
  l: "feni",
  d: [
   "acima",
   "em cima",
   "cima",
   "maior",
   "mais (em algo)"
  ]
 },
 {
  l: "fert",
  d: [
   "professor",
   "orientador",
   "comandante",
   "o que ensina",
   "o que orienta ou comanda com um objetivo educacional ou prático"
  ]
 },
 {
  l: "fery",
  d: [
   "parte",
   "pedaço",
   "contexto",
   "membro",
   "órgão"
  ]
 },
 {
  l: "fglu",
  d: [
   "normal",
   "padrão",
   "universal"
  ]
 },
 {
  l: "fhlo",
  d: [
   "automático",
   "individual",
   "faz-tudo"
  ]
 },
 {
  l: "fini",
  d: [
   "agudo",
   "pontudo",
   "alto",
   "alta frequência",
   "singular",
   "único",
   "especial"
  ]
 },
 {
  l: "flai",
  d: [
   "álcool",
   "líquido (como para automóveis ou limpeza)",
   "bebida alcoólica"
  ]
 },
 {
  l: "flar",
  d: [
   "impressora",
   "equipamento que imprime",
   "impressionador",
   "que impressiona",
   "causa impressão",
   "cópia",
   "semelhante"
  ]
 },
 {
  l: "flei",
  d: [
   "ouvido",
   "audição",
   "microfone",
   "dispositivo de captura de som ou frequência",
   "frequencímetro",
   "gravador",
   "aparelho de som (para captura de som)"
  ]
 },
 {
  l: "flix",
  d: [
   "gato",
   "felino",
   "cheio de energia",
   "radical",
   "animal"
  ]
 },
 {
  l: "floi",
  d: [
   "diesel",
   "combustível de fácil explosão",
   "pessoa sensível a variações",
   "ansiedade",
   "ansioso"
  ]
 },
 {
  l: "flui",
  d: [
   "gasolina",
   "pessoa atraente",
   "que causa calor",
   "alimento",
   "fonte",
   "causa"
  ]
 },
 {
  l: "fout",
  d: [
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
 {
  l: "fouk",
  d: [
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
 {
  l: "fpri",
  d: [
   "documento",
   "arquivo",
   "folha",
   "identidade",
   "algo que represente algum ser",
   "registro",
   "traço",
   "pista de algo que indique a alguém",
   "conta",
   "contato"
  ]
 },
 {
  l: "frav",
  d: [
   "ser aquilo ou aquilo que tem entre as pernas (definido pelo sexo ou indefinido caso não interessado",
   "genitália"
  ],
  e: [
    [ "ue tue nifrav","eu (sou) / (tenho um(a)) (órgão do sexo feminino)" ]
  ]
 },
 {
  l: "fraq",
  d: [
   "ser aquele que tem interesse em um sexo específico ou ambos (veja exemplos)"
  ],
  e: [
    [ "nifraq","interessado em sexo feminino (homossexual ou hétero dependendo do sujeito)" ],
    [ "nafraq","interessado em sexo masculino (homossexual ou hétero dependendo do sujeito)" ],
    [ "fraq","interessado em qualquer sexo ou indefinido" ]
  ]  
 },
 {
  l: "frax",
  d: [
   "bomba",
   "mina",
   "granada",
   "explosivo",
   "spam",
   "irritante",
   "o que não se quer perto"
  ]
 },
 {
  l: "frea",
  d: [
   "carne",
   "material de origem animal",
   "couro"
  ]
 },
 {
  l: "frex",
  d: [
   "colega próximo",
   "parceiro",
   "dupla",
   "faz parte de sua equipe pessoal"
  ]
 },
 {
  l: "froc",
  d: [
   "rocha",
   "pedra",
   "duro",
   "resistente",
   "persistente ou cabeça dura",
   "pouco valioso",
   "comum"
  ]
 },
 {
  l: "frot",
  d: [
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
 {
  l: "fruf",
  d: [
   "pelo",
   "pelugem",
   "penas",
   "plumagem (caso esteja falando de aves)",
   "cobertura",
   "cobertor",
   "algo que cobre e mantém quente ou protege de algo",
   "armadura mística ou especial que te mantém protegido"
  ]
 },
 {
  l: "ftik",
  d: [
   "forçado",
   "feito sob medida",
   "apertado",
   "planejado perfeitamente",
   "limitado",
   "pressionado (a fazer algo)",
   "obrigado"
  ]
 },
 {
  l: "ftuk",
  d: [
   "sanduíche",
   "hambúrguer"
  ]
 },
 {
  l: "fual",
  d: [
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
   "construído sem erros"
  ]
 },
 {
  l: "fuil",
  d: [
   "bem",
   "bom",
   "estar bem",
   "feliz",
   "alegre",
   "positivo",
   "felicidade",
   "certo",
   "correto",
   "perfeitamente bem",
   "bem cuidado",
   "em perfeitas condições"
  ]
 },
 {
  l: "fury",
  d: [
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
 {
  l: "fytu",
  d: [
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
 {
  l: "gale",
  d: [
   "acesso",
   "entrada",
   "porta",
   "acessibilidade",
   "assistência"
  ]
 },
 {
  l: "game",
  d: [
   "pá",
   "ferramenta manual para escavar",
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
 {
  l: "gatx",
  d: [
   "lindo",
   "belo",
   "bonito",
   "elegante",
   "bem feito",
   "bem trabalhado",
   "que dá orgulho",
   "bem composto",
   "bem misturado",
   "destaque entre outros",
   "gostoso"
  ]
 },
 {
  l: "gaty",
  d: [
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
 {
  l: "gdaj",
  d: [
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
  ],
  e: [
    [ "ae tue gdaj","você está \"precisando de ajuda\""]
  ]
 },
 {
  l: "gefh",
  d: [
   "mãe (não necessariamente mulher)",
   "aquele que é reconhecido como o mais importante num grupo de pessoas",
   "pessoa de alto valor num grupo, por mérito, honra, não por dinheiro ou poder",
   "pai"
  ]
 },
 {
  l: "geft",
  d: [
   "teclado",
   "instrumentos de múltiplas teclas",
   "interface de um dispositivo",
   "senha",
   "palavra-chave",
   "resposta",
   "chave",
   "ponto importante",
   "relevante"
  ]
 },
 {
  l: "gfad",
  d: [
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
 {
  l: "gflu",
  d: [
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
 {
  l: "gfoh",
  d: [
   "desde",
   "a partir de",
   "a datar de",
   "a contar de",
   "com início em",
   "já",
   "já em",
   "agora",
   "imediatamente",
   "no momento"
  ]
 },
 {
  l: "ghea",
  d: [
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
 {
  l: "ghit",
  d: [
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
 {
  l: "giit",
  d: [
   "sobre",
   "por cima",
   "sobrevoando",
   "voando",
   "flutuando",
   "acima",
   "por cima de algo",
   "sobrepondo algo",
   "exposto",
   "encontrável",
   "visível",
   "desprotegido",
   "livre",
   "liberto",
   "descontrolado"
  ]
 },
 {
  l: "gleh",
  d: [
   "mole",
   "flácido",
   "flexível",
   "demorado",
   "tardio",
   "pausado",
   "líquido (estado da matéria)"
  ]
 },
 {
  l: "glut",
  d: [
   "círculo",
   "esfera",
   "objeto radial sem cantos",
   "grupo",
   "quadrilha",
   "conjunto",
   "equipe"
  ]
 },
 {
  l: "goto",
  d: [
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
 {
  l: "graf",
  d: [
   "mesmo",
   "até",
   "inclusive",
   "também",
   "ainda",
   "próprio",
   "tal",
   "precisamente",
   "exatamente",
   "justamente"
  ]
 },
 {
  l: "grah",
  d: [
   "já",
   "agora",
   "neste momento",
   "na hora"
  ]
 },
 {
  l: "grak",
  d: [
   "bicho",
   "verme"
  ]
 },
 {
  l: "grin",
  d: [
   "guitarra",
   "violão elétrico"
  ]
 },
 {
  l: "gren",
  d: [
   "violão",
   "instrumento de cordas",
   "instrumento musical de cordas",
   "que vibra",
   "gera som por vibrações"
  ]
 },
 {
  l: "gron",
  d: [
   "teste",
   "experimento",
   "experiência",
   "prova (colocar algo à prova)",
   "exercício"
  ]
 },
 {
  l: "grug",
  d: [
   "abaixo",
   "baixo",
   "grave",
   "fundo",
   "profundo"
  ]
 },
 {
  l: "gruy",
  d: [
   "leoa",
   "leão",
   "felino selvagem"
  ]
 },
 {
  l: "guni",
  d: [
   "ideia",
   "sugestão"
  ]
 },
 {
  l: "gura",
  d: [
   "bola",
   "esfera"
  ]
 },
 {
  l: "gure",
  d: [
   "informação",
   "notícia"
  ]
 },
 {
  l: "gyla",
  d: [
   "ritmo",
   "movimento"
  ]
 },
 {
  l: "gyth",
  d: [
   "chocolate"
  ]
 },
 {
  l: "gyyk",
  d: [
   "ainda"
  ]
 },
 {
  l: "hugi",
  d: [
   "conteúdo",
   "matéria"
  ]
 },
 {
  l: "hune",
  d: [
   "casamento"
  ]
 },
 {
  l: "hung",
  d: [
   "sal"
  ]
 },
 {
  l: "hute",
  d: [
   "casa"
  ]
 },
 {
  l: "huti",
  d: [
   "ânus"
  ]
 },
 {
  l: "huty",
  d: [
   "terreno",
   "área",
   "espaço (de médio tamanho, para uma casa ou poucas casas)"
  ]
 },
 {
  l: "huwg",
  d: [
   "bosta",
   "merda",
   "fezes"
  ]
 },
 {
  l: "hyor",
  d: [
   "rua"
  ]
 },
 {
  l: "iata",
  d: [
   "título",
   "topo"
  ]
 },
 {
  l: "iceb",
  d: [
   "cebola"
  ]
 },
 {
  l: "igrn",
  d: [
   "veado"
  ]
 },
 {
  l: "ihgl",
  d: [
   "inglês"
  ]
 },
 {
  l: "ilpe",
  d: [
   "caldo"
  ]
 },
 {
  l: "inna",
  d: [
   "um",
   "uma"
  ]
 },
 {
  l: "issu",
  d: [
   "calcanhar"
  ]
 },
 {
  l: "isti",
  d: [
   "ovíparo"
  ]
 },
 {
  l: "isto",
  d: [
   "herbívoro"
  ]
 },
 {
  l: "itep",
  d: [
   "tempero",
   "orégano"
  ]
 },
 {
  l: "jfab",
  d: [
   "faculdade"
  ]
 },
 {
  l: "jiak",
  d: [
   "unidade",
   "medida",
   "dimensão",
   "métrica",
   "universo",
   "tamanho"
  ]
 },
 {
  l: "jolo",
  d: [
   "grande",
   "maior",
   "mais",
   "muito",
   "vários",
   "bastante",
   "maior"
  ]
 },
 {
  l: "joqe",
  d: [
   "joystick"
  ]
 },
 {
  l: "julk",
  d: [
   "foda"
  ]
 },
 {
  l: "kaet",
  d: [
   "pobre",
   "pobreza"
  ]
 },
 {
  l: "kaga",
  d: [
   "mercado",
   "shopping"
  ]
 },
 {
  l: "kaka",
  d: [
   "atrevido"
  ]
 },
 {
  l: "kala",
  d: [
   "caramba"
  ]
 },
 {
  l: "kara",
  d: [
   "loucura"
  ]
 },
 {
  l: "kark",
  d: [
   "atualização"
  ]
 },
 {
  l: "kefh",
  d: [
   "tia",
   "tio"
  ]
 },
 {
  l: "kerk",
  d: [
   "desatualização"
  ]
 },
 {
  l: "kina",
  d: [
   "vegetal"
  ]
 },
 {
  l: "kini",
  d: [
   "episódio",
   "caso"
  ]
 },
 {
  l: "kjor",
  d: [
   "personalidade",
   "pessoa",
   "senhor",
   "senhoria"
  ]
 },
 {
  l: "klai",
  d: [
   "código",
   "senha"
  ]
 },
 {
  l: "klan",
  d: [
   "grupo",
   "time"
  ]
 },
 {
  l: "klet",
  d: [
   "barriga"
  ]
 },
 {
  l: "klin",
  d: [
   "até",
   "tchau"
  ]
 },
 {
  l: "knep",
  d: [
   "certo",
   "correto",
   "verdade",
   "verdadeiro",
   "real",
   "realidade"
  ]
 },
 {
  l: "knet",
  d: [
   "série"
  ]
 },
 {
  l: "knyh",
  d: [
   "briga",
   "luta"
  ]
 },
 {
  l: "kral",
  d: [
   "livre"
  ]
 },
 {
  l: "krat",
  d: [
   "problema"
  ]
 },
 {
  l: "krfi",
  d: [
   "favor"
  ]
 },
 {
  l: "krka",
  d: [
   "preso"
  ]
 },
 {
  l: "kruk",
  d: [
   "tradução"
  ]
 },
 {
  l: "ktra",
  d: [
   "entre"
  ]
 },
 {
  l: "ktuh",
  d: [
   "atenção"
  ]
 },
 {
  l: "kuil",
  d: [
   "saúde"
  ]
 },
 {
  l: "kuky",
  d: [
   "céu"
  ]
 },
 {
  l: "kulh",
  d: [
   "máquina"
  ]
 },
 {
  l: "kurp",
  d: [
   "inútil"
  ]
 },
 {
  l: "kwyh",
  d: [
   "espaço (não muito grande)",
   "quarto"
  ]
 },
 {
  l: "kyek",
  d: [
   "mendigo"
  ]
 },
 {
  l: "kyia",
  d: [
   "oi",
   "olá"
  ]
 },
 {
  l: "kyna",
  d: [
   "porra"
  ]
 },
 {
  l: "lala",
  d: [
   "gelo",
   "gelado",
   "sorvete",
   "picolé"
  ]
 },
 {
  l: "larb",
  d: [
   "trabalhador"
  ]
 },
 {
  l: "lare",
  d: [
   "alguém"
  ]
 },
 {
  l: "lari",
  d: [
   "algum",
   "alguma"
  ]
 },
 {
  l: "lark",
  d: [
   "ocupado"
  ]
 },
 {
  l: "lhun",
  d: [
   "pulso"
  ]
 },
 {
  l: "lide",
  d: [
   "ímã"
  ]
 },
 {
  l: "lifu",
  d: [
   "decepcionado",
   "desmotivado"
  ]
 },
 {
  l: "liit",
  d: [
   "frio",
   "inverno"
  ]
 },
 {
  l: "liku",
  d: [
   "antigo",
   "relíquia",
   "histórico",
   "outrora"
  ]
 },
 {
  l: "lili",
  d: [
   "riso"
  ]
 },
 {
  l: "lily",
  d: [
   "sorriso"
  ]
 },
 {
  l: "limy",
  d: [
   "biscoito",
   "bolacha"
  ]
 },
 {
  l: "lint",
  d: [
   "língua"
  ]
 },
 {
  l: "liuf",
  d: [
   "mal",
   "mau",
   "triste"
  ]
 },
 {
  l: "liuk",
  d: [
   "péssimo",
   "horrível",
   "terrível"
  ]
 },
 {
  l: "lofh",
  d: [
   "padrinho",
   "madrinha"
  ]
 },
 {
  l: "lofi",
  d: [
   "branco"
  ]
 },
 {
  l: "lohp",
  d: [
   "trás"
  ]
 },
 {
  l: "loht",
  d: [
   "cara",
   "face",
   "frente"
  ]
 },
 {
  l: "lokl",
  d: [
   "acaso"
  ]
 },
 {
  l: "lokt",
  d: [
   "para",
   "pra"
  ]
 },
 {
  l: "loku",
  d: [
   "osso"
  ]
 },
 {
  l: "lolk",
  d: [
   "da",
   "de",
   "do",
   "por"
  ]
 },
 {
  l: "lolo",
  d: [
   "ovo"
  ]
 },
 {
  l: "lope",
  d: [
   "folha",
   "papel",
   "pena"
  ]
 },
 {
  l: "lopk",
  d: [
   "deus"
  ]
 },
 {
  l: "lowe",
  d: [
   "universidade"
  ]
 },
 {
  l: "lual",
  d: [
   "viagem"
  ]
 },
 {
  l: "luka",
  d: [
   "perna"
  ]
 },
 {
  l: "luly",
  d: [
   "semente"
  ]
 },
 {
  l: "lumu",
  d: [
   "caderno",
   "livro"
  ]
 },
 {
  l: "lung",
  d: [
   "ombro"
  ]
 },
 {
  l: "luph",
  d: [
   "coxa"
  ]
 },
 {
  l: "lurd",
  d: [
   "distante",
   "longe"
  ]
 },
 {
  l: "lure",
  d: [
   "gênio",
   "inteligente"
  ]
 },
 {
  l: "luyo",
  d: [
   "dragão"
  ]
 },
 {
  l: "lyka",
  d: [
   "reino"
  ]
 },
 {
  l: "lyru",
  d: [
   "feio"
  ]
 },
 {
  l: "lyvo",
  d: [
   "mesquinho",
   "fútil"
  ]
 },
 {
  l: "maly",
  d: [
   "redação",
   "texto"
  ]
 },
 {
  l: "maah",
  d: [
   "sim",
   "claro"
  ]
 },
 {
  l: "maeh",
  d: [
   "certeza "
  ]
 },
 {
  l: "mana",
  d: [
   "não",
   "incerto"
  ]
 },
 {
  l: "mank",
  d: [
   "contrário",
   "inverso",
   "des-",
   "a-"
  ]
 },
 {
  l: "maol",
  d: [
   "então",
   "portanto"
  ]
 },
 {
  l: "medy",
  d: [
   "medicina",
   "médico"
  ]
 },
 {
  l: "mhat",
  d: [
   "matemática"
  ]
 },
 {
  l: "mhut",
  d: [
   "constante",
   "estável"
  ]
 },
 {
  l: "molg",
  d: [
   "macarrão"
  ]
 },
 {
  l: "molh",
  d: [
   "boi",
   "vaca"
  ]
 },
 {
  l: "muna",
  d: [
   "ou",
   "entretanto"
  ]
 },
 {
  l: "munu",
  d: [
   "lição",
   "tarefa"
  ]
 },
 {
  l: "nagt",
  d: [
   "estresse"
  ]
 },
 {
  l: "nape",
  d: [
   "apenas",
   "só"
  ]
 },
 {
  l: "naqi",
  d: [
   "escolha",
   "opção",
   "configuração"
  ]
 },
 {
  l: "nheh",
  d: [
   "igreja"
  ]
 },
 {
  l: "nhoe",
  d: [
   "nove"
  ]
 },
 {
  l: "nhum",
  d: [
   "sorte"
  ]
 },
 {
  l: "nili",
  d: [
   "frase "
  ]
 },
 {
  l: "njvn",
  d: [
   "alho"
  ]
 },
 {
  l: "noag",
  d: [
   "batata"
  ]
 },
 {
  l: "nofy",
  d: [
   "(deixado) sozinho",
   "só"
  ]
 },
 {
  l: "nolc",
  d: [
   "anti",
   "sem"
  ]
 },
 {
  l: "nuki",
  d: [
   "coitado"
  ]
 },
 {
  l: "nukn",
  d: [
   "colaboração"
  ]
 },
 {
  l: "nune",
  d: [
   "fluente"
  ]
 },
 {
  l: "nury",
  d: [
   "permanente",
   "para sempre"
  ]
 },
 {
  l: "nyht",
  d: [
   "essa",
   "esse",
   "esta",
   "este"
  ]
 },
 {
  l: "nyil",
  d: [
   "pior"
  ]
 },
 {
  l: "nyta",
  d: [
   "química",
   "químico"
  ]
 },
 {
  l: "oaut",
  d: [
   "espelho"
  ]
 },
 {
  l: "ohde",
  d: [
   "um"
  ]
 },
 {
  l: "ohte",
  d: [
   "oito"
  ]
 },
 {
  l: "olal",
  d: [
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
 {
  l: "olar",
  d: [
   "fórmula",
   "receita",
   "dicionário"
  ]
 },
 {
  l: "oloj",
  d: [
   "menor",
   "menos",
   "pequeno",
   "pouco",
   "menor"
  ]
 },
 {
  l: "otsi",
  d: [
   "carnívoro"
  ]
 },
 {
  l: "otun",
  d: [
   "música",
   "músico"
  ]
 },
 {
  l: "ougt",
  d: [
   "olho"
  ]
 },
 {
  l: "oyye",
  d: [
   "loiro"
  ]
 },
 {
  l: "ozuk",
  d: [
   "onda"
  ]
 },
 {
  l: "pane",
  d: [
   "próton"
  ]
 },
 {
  l: "pate",
  d: [
   "planta",
   "árvore"
  ]
 },
 {
  l: "paut",
  d: [
   "caralho"
  ]
 },
 {
  l: "pedt",
  d: [
   "antes",
   "último"
  ]
 },
 {
  l: "penk",
  d: [
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
 {
  l: "phaf",
  d: [
   "farmacêutico",
   "farmácia"
  ]
 },
 {
  l: "phed",
  d: [
   "foto",
   "imagem"
  ]
 },
 {
  l: "phlo",
  d: [
   "alto"
  ]
 },
 {
  l: "phoa",
  d: [
   "fone"
  ]
 },
 {
  l: "phor",
  d: [
   "português"
  ]
 },
 {
  l: "phuf",
  d: [
   "cotovelada"
  ]
 },
 {
  l: "phus",
  d: [
   "física"
  ]
 },
 {
  l: "pitn",
  d: [
   "nariz"
  ]
 },
 {
  l: "pikt",
  d: [
   "alicate"
  ]
 },
 {
  l: "plar",
  d: [
   "trabalho"
  ]
 },
 {
  l: "plep",
  d: [
   "café",
   "cafeína"
  ]
 },
 {
  l: "plek",
  d: [
   "bebida energética",
   "energético",
   "eletricidade",
   "elétrico"
  ]
 },
 {
  l: "plof",
  d: [
   "responsável"
  ]
 },
 {
  l: "plug",
  d: [
   "pulsação"
  ]
 },
 {
  l: "poad",
  d: [
   "massa"
  ]
 },
 {
  l: "poag",
  d: [
   "manteiga"
  ]
 },
 {
  l: "podr",
  d: [
   "capô"
  ]
 },
 {
  l: "pody",
  d: [
   "pudim",
   "pé"
  ]
 },
 {
  l: "pofh",
  d: [
   "chute"
  ]
 },
 {
  l: "pohl",
  d: [
   "frente"
  ]
 },
 {
  l: "poje",
  d: [
   "padre"
  ]
 },
 {
  l: "pola",
  d: [
   "saco"
  ]
 },
 {
  l: "pole",
  d: [
   "detalhe",
   "ponto",
   "pixel"
  ]
 },
 {
  l: "polh",
  d: [
   "joelhada"
  ]
 },
 {
  l: "polt",
  d: [
   "lábio"
  ]
 },
 {
  l: "poly",
  d: [
   "algo",
   "coisa",
   "objeto",
   "lance", 
   "parada", 
   "rolê", 
   "aposta",
   "chute"
  ]
 },
 {
  l: "pope",
  d: [
   "bebida"
  ]
 },
 {
  l: "pora",
  d: [
   "futebol"
  ]
 },
 {
  l: "pote",
  d: [
   "tela",
   "arte",
   "janela"
  ]
 },
 {
  l: "potr",
  d: [
   "penal"
  ]
 },
 {
  l: "pous",
  d: [
   "sopa"
  ]
 },
 {
  l: "praf",
  d: [
   "pediatra",
   "pediatria"
  ]
 },
 {
  l: "pred",
  d: [
   "som"
  ]
 },
 {
  l: "proe",
  d: [
   "adaptador",
   "conector"
  ]
 },
 {
  l: "prud",
  d: [
   "cabo",
   "fio",
   "internet",
   "net",
   "enrolado",
   "embaralhado"
  ]
 },
 {
  l: "ptha",
  d: [
   "plástico"
  ]
 },
 {
  l: "ptos",
  d: [
   "geralmente"
  ]
 },
 {
  l: "puag",
  d: [
   "margarina"
  ]
 },
 {
  l: "pulh",
  d: [
   "porco"
  ]
 },
 {
  l: "pury",
  d: [
   "estágio",
   "parcial",
   "temporário",
   "estagiário",
   "estação",
   "período"
  ]
 },
 {
  l: "qene",
  d: [
   "quente"
  ]
 },
 {
  l: "qnad",
  d: [
   "quando"
  ]
 },
 {
  l: "qute",
  d: [
   "quatro"
  ]
 },
 {
  l: "qwut",
  d: [
   "malandragem",
   "malandro"
  ]
 },
 {
  l: "raki",
  d: [
   "guerra"
  ]
 },
 {
  l: "raih",
  d: [
   "assim"
  ]
 },
 {
  l: "raik",
  d: [
   "martelo"
  ]
 },
 {
  l: "rara",
  d: [
   "bora",
   "em boa hora",
   "em perfeito estado",
   "ao ponto",
   "no ponto",
   "temperado"
  ]
 },
 {
  l: "rauk",
  d: [
   "sonho"
  ]
 },
 {
  l: "raut",
  d: [
   "mouse",
   "rato",
   "peste"
  ]
 },
 {
  l: "regh",
  d: [
   "relógio"
  ]
 },
 {
  l: "reka",
  d: [
   "aqui"
  ]
 },
 {
  l: "reko",
  d: [
   "rumo"
  ]
 },
 {
  l: "rela",
  d: [
   "ali"
  ]
 },
 {
  l: "relo",
  d: [
   "caminho",
   "percurso"
  ]
 },
 {
  l: "relh",
  d: [
    "avestruz"
  ]
 },
 {
  l: "rhfa",
  d: [
   "rádio"
  ]
 },
 {
  l: "rhis",
  d: [
   "história"
  ]
 },
 {
  l: "rifn",
  d: [
   "cabelo"
  ]
 },
 {
  l: "ripy",
  d: [
   "perigo"
  ]
 },
 {
  l: "rirt",
  d: [
   "escuro",
   "escuridão",
   "noite",
   "preto"
  ]
 },
 {
  l: "rote",
  d: [
   "filme"
  ]
 },
 {
  l: "roti",
  d: [
   "remoto"
  ]
 },
 {
  l: "ruka",
  d: [
   "barra",
   "régua"
  ]
 },
 {
  l: "ruky",
  d: [
   "alavanca"
  ]
 },
 {
  l: "rury",
  d: [
   "tipo"
  ]
 },
 {
  l: "rutu",
  d: [
   "desenho"
  ]
 },
 {
  l: "rwes",
  d: [
   "porta"
  ]
 },
 {
  l: "ryke",
  d: [
   "droga",
   "porcaria"
  ]
 },
 {
  l: "ryty",
  d: [
   "início",
   "menu"
  ]
 },
 {
  l: "saan",
  d: [
   "bolado"
  ]
 },
 {
  l: "sadu",
  d: [
   "separado"
  ]
 },
 {
  l: "saki",
  d: [
   "paz"
  ]
 },
 {
  l: "salu",
  d: [
   "cursinho",
   "curso"
  ]
 },
 {
  l: "saqi",
  d: [
   "idade"
  ]
 },
 {
  l: "sari",
  d: [
   "mas",
   "porém"
  ]
 },
 {
  l: "sase",
  d: [
   "total"
  ]
 },
 {
  l: "sele",
  d: [
   "nem"
  ]
 },
 {
  l: "shie",
  d: [
   "ciências"
  ]
 },
 {
  l: "skaa",
  d: [
   "janeiro"
  ]
 },
 {
  l: "skab",
  d: [
   "fevereiro"
  ]
 },
 {
  l: "skac",
  d: [
   "março"
  ]
 },
 {
  l: "skad",
  d: [
   "abril"
  ]
 },
 {
  l: "skae",
  d: [
   "maio"
  ]
 },
 {
  l: "skaf",
  d: [
   "junho"
  ]
 },
 {
  l: "skag",
  d: [
   "julho"
  ]
 },
 {
  l: "skah",
  d: [
   "agosto"
  ]
 },
 {
  l: "skai",
  d: [
   "setembro"
  ]
 },
 {
  l: "skaj",
  d: [
   "outubro"
  ]
 },
 {
  l: "skak",
  d: [
   "novembro"
  ]
 },
 {
  l: "skal",
  d: [
   "dezembro"
  ]
 },
 {
  l: "skra",
  d: [
   "imbecil"
  ]
 },
 {
  l: "slag",
  d: [
   "salgado"
  ]
 },
 {
  l: "sleg",
  d: [
   "cera"
  ]
 },
 {
  l: "smug",
  d: [
   "cigarro"
  ]
 },
 {
  l: "snop",
  d: [
   "jamais",
   "nunca"
  ]
 },
 {
  l: "snuz",
  d: [
   "cama"
  ]
 },
 {
  l: "sofy",
  d: [
   "filosofia",
   "filósofo"
  ]
 },
 {
  l: "spet",
  d: [
   "sombra"
  ]
 },
 {
  l: "spot",
  d: [
   "sempre"
  ]
 },
 {
  l: "srag",
  d: [
   "frango"
  ]
 },
 {
  l: "srak",
  d: [
   "dada"
  ]
 },
 {
  l: "sret",
  d: [
   "faxina"
  ]
 },
 {
  l: "stop",
  d: [
   "nunca"
  ]
 },
 {
  l: "stor",
  d: [
   "host"
  ]
 },
 {
  l: "sufe",
  d: [
   "sete"
  ]
 },
 {
  l: "suff",
  d: [
   "novo",
   "novamente",
   "de novo"
  ]
 },
 {
  l: "suft",
  d: [
   "suco"
  ]
 },
 {
  l: "sufy",
  d: [
   "infernal",
   "inferno",
   "diabo"
  ]
 },
 {
  l: "sulu",
  d: [
   "diferente"
  ]
 },
 {
  l: "sute",
  d: [
   "seis"
  ]
 },
 {
  l: "swag",
  d: [
   "servidor"
  ]
 },
 {
  l: "swap",
  d: [
   "agora",
   "versão"
  ]
 },
 {
  l: "swen",
  d: [
   "preguiçoso"
  ]
 },
 {
  l: "swyn",
  d: [
   "forma"
  ]
 },
 {
  l: "tahi",
  d: [
   "resposta",
   "solução"
  ]
 },
 {
  l: "tart",
  d: [
   "estalactite"
  ]
 },
 {
  l: "taek",
  d: [
   "estado"
  ]
 },
 {
  l: "tdod",
  d: [
   "tomate"
  ]
 },
 {
  l: "tdou",
  d: [
   "ou"
  ]
 },
 {
  l: "teak",
  d: [
   "rico",
   "riqueza"
  ]
 },
 {
  l: "tofh",
  d: [
   "irmão",
   "irmã"
  ]
 },
 {
  l: "tohd",
  d: [
   "todo",
   "tudo",
   "toda",
   "cada"
  ]
 },
 {
  l: "tops",
  d: [
   "vez"
  ]
 },
 {
  l: "topt",
  d: [
   "divertido",
   "legal"
  ]
 },
 {
  l: "topk",
  d: [
   "chata",
   "chato"
  ]
 },
 {
  l: "tort",
  d: [
   "hoje"
  ]
 },
 {
  l: "totr",
  d: [
   "amanhã"
  ]
 },
 {
  l: "tpos",
  d: [
   "raramente"
  ]
 },
 {
  l: "trar",
  d: [
   "estalagmite"
  ]
 },
 {
  l: "trat",
  d: [
   "eletricidade"
  ]
 },
 {
  l: "trie",
  d: [
   "século"
  ]
 },
 {
  l: "trir",
  d: [
   "dia"
  ]
 },
 {
  l: "troa",
  d: [
   "morno"
  ]
 },
 {
  l: "troe",
  d: [
   "três"
  ]
 },
 {
  l: "trot",
  d: [
   "ontem"
  ]
 },
 {
  l: "trta",
  d: [
   "dentro",
   "em",
   "na",
   "no",
   "que",
   "se"
  ]
 },
 {
  l: "true",
  d: [
   "forte"
  ]
 },
 {
  l: "trui",
  d: [
   "computador"
  ]
 },
 {
  l: "trur",
  d: [
   "lado"
  ]
 },
 {
  l: "trus",
  d: [
   "vidro",
   "copo",
   "balde",
   "reservatório",
   "bacia"
  ]
 },
 {
  l: "trut",
  d: [
   "esquerda",
   "esquerdo"
  ]
 },
 {
  l: "turt",
  d: [
   "direita",
   "direito"
  ]
 },
 {
  l: "tute",
  d: [
   "cérebro"
  ]
 },
 {
  l: "tuti",
  d: [
   "amigo"
  ]
 },
 {
  l: "tyrr",
  d: [
   "hora",
   "momento"
  ]
 },
 {
  l: "uadu",
  d: [
   "junto",
   "unido"
  ]
 },
 {
  l: "uhfu",
  d: [
   "joelho"
  ]
 },
 {
  l: "uhle",
  d: [
   "apoio (moral ou material)",
   "suporte"
  ]
 },
 {
  l: "uhly",
  d: [
   "mesa"
  ]
 },
 {
  l: "uhno",
  d: [
   "estômago"
  ]
 },
 {
  l: "uhpe",
  d: [
   "baleia"
  ]
 },
 {
  l: "uhro",
  d: [
   "dez"
  ]
 },
 {
  l: "uhso",
  d: [
   "zero"
  ]
 },
 {
  l: "uhtr",
  d: [
   "clima",
   "relógio",
   "tempo"
  ]
 },
 {
  l: "uise",
  d: [
   "fácil"
  ]
 },
 {
  l: "ulus",
  d: [
   "igual"
  ]
 },
 {
  l: "unmu",
  d: [
   "mão"
  ]
 },
 {
  l: "uolo",
  d: [
   "arroz"
  ]
 },
 {
  l: "urno",
  d: [
   "intestino"
  ]
 },
 {
  l: "utro",
  d: [
   "cem"
  ]
 },
 {
  l: "uviu",
  d: [
   "peixe"
  ]
 },
 {
  l: "varu",
  d: [
   "lobo"
  ]
 },
 {
  l: "valk",
  d: [
   "queijo"
  ]
 },
 {
  l: "vest",
  d: [
   "leite "
  ]
 },
 {
  l: "waag",
  d: [
   "louça"
  ]
 },
 {
  l: "waki",
  d: [
   "adolescente",
   "jovem"
  ]
 },
 {
  l: "wala",
  d: [
   "palavra"
  ]
 },
 {
  l: "wany",
  d: [
   "criança"
  ]
 },
 {
  l: "warq",
  d: [
   "dedo"
  ]
 },
 {
  l: "witi",
  d: [
   "sério",
   "sinceramente",
   "carinhosamente"
  ]
 },
 {
  l: "woka",
  d: [
   "outro"
  ]
 },
 {
  l: "wuag",
  d: [
   "aula"
  ]
 },
 {
  l: "wuha",
  d: [
   "vampiro",
   "máquina relacionada a sangue",
   "sangue"
  ]
 },
 {
  l: "wuhp",
  d: [
   "super"
  ]
 },
 {
  l: "wuje",
  d: [
   "quem"
  ]
 },
 {
  l: "wuky",
  d: [
   "adolescência"
  ]
 },
 {
  l: "wune",
  d: [
   "onde"
  ]
 },
 {
  l: "wuni",
  d: [
   "infância"
  ]
 },
 {
  l: "wupe",
  d: [
   "qual"
  ]
 },
 {
  l: "wuqa",
  d: [
   "pergunta"
  ]
 },
 {
  l: "wuqe",
  d: [
   "aleatório",
   "qualquer"
  ]
 },
 {
  l: "wush",
  d: [
   "academia"
  ]
 },
 {
  l: "wusu",
  d: [
   "relação"
  ]
 },
 {
  l: "wuyh",
  d: [
   "extremo",
   "intensivo"
  ]
 },
 {
  l: "yair",
  d: [
   "família"
  ]
 },
 {
  l: "yaye",
  d: [
   "água "
  ]
 },
 {
  l: "yayu",
  d: [
   "vida"
  ]
 },
 {
  l: "yela",
  d: [
   "laranja"
  ]
 },
 {
  l: "yelo",
  d: [
   "marrom"
  ]
 },
 {
  l: "yemo",
  d: [
   "memória"
  ]
 },
 {
  l: "yepo",
  d: [
   "verde"
  ]
 },
 {
  l: "yeur",
  d: [
   "inscrito"
  ]
 },
 {
  l: "yhrn",
  d: [
   "e",
   "também"
  ]
 },
 {
  l: "yloy",
  d: [
   "cenoura"
  ]
 },
 {
  l: "yuoa",
  d: [
   "lua",
   "ferrugem",
   "desgastado",
   "torrado"
  ]
 },
 {
  l: "ymer",
  d: [
   "vídeo"
  ]
 },
 {
  l: "yohu",
  d: [
   "baú",
   "caixa"
  ]
 },
 {
  l: "yoio",
  d: [
   "roxo"
  ]
 },
 {
  l: "yoiu",
  d: [
   "vermelho"
  ]
 },
 {
  l: "yolo",
  d: [
   "azul"
  ]
 },
 {
  l: "yomu",
  d: [
   "cartão"
  ]
 },
 {
  l: "yopo",
  d: [
   "turquesa"
  ]
 },
 {
  l: "yopu",
  d: [
   "dourado"
  ]
 },
 {
  l: "youn",
  d: [
   "vina",
   "linguiça",
   "salsicha"
  ]
 },
 {
  l: "youo",
  d: [
   "bege"
  ]
 },
 {
  l: "youp",
  d: [
   "prata"
  ]
 },
 {
  l: "yout",
  d: [
   "jeito"
  ]
 },
 {
  l: "yoyo",
  d: [
   "aparelho"
  ]
 },
 {
  l: "yoyu",
  d: [
   "celular",
   "telefone"
  ]
 },
 {
  l: "yrui",
  d: [
   "sono"
  ]
 },
 {
  l: "yryr",
  d: [
   "alienígena",
   "invasor"
  ]
 },
 {
  l: "ytre",
  d: [
   "bissexto"
  ]
 },
 {
  l: "ytyr",
  d: [
   "fim"
  ]
 },
 {
  l: "yuiu",
  d: [
   "amarelo"
  ]
 },
 {
  l: "yumu",
  d: [
   "tecido",
   "têxtil",
   "textura"
  ]
 },
 {
  l: "yuno",
  d: [
   "braço"
  ]
 },
 {
  l: "yupo",
  d: [
   "moreno"
  ]
 },
 {
  l: "yuuh",
  d: [
   "cinza"
  ]
 },
 {
  l: "zuyh",
  d: [
   "sentido"
  ]
 },
 {
  l: "zold",
  d: [
   "velocidade",
   "velocímetro"
  ]
 },
 {
  l: "yort",
  d: [
   "rosa"
  ]
 },
 {
  l: "yopy",
  d: [
   "foca"
  ]
 },
 {
  "discontinued": true,
  l: "grye",
  d: [
   "trocado para => gkuku",
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
 {
  "discontinued": true,
  l: "nilt",
  d: [
   "trocado para => byhku",
   "banho"
  ]
 },
 {
  "discontinued": true,
  l: "uyok",
  d: [
   "trocado para => uyoku",
   "amor"
  ]
 },
 {
  "discontinued": true,
  l: "pohl",
  d: [
   "trocado para => loht",
   "frente"
  ]
 },
 {
  "discontinued": true,
  l: "krum",
  d: [
   "trocado para => nakjor",
   "homem",
   "macho"
  ]
 },
 {
  "discontinued": true,
  l: "murk",
  d: [
   "trocado para => nikjor",
   "garota",
   "mulher"
  ]
 },
 {
  "discontinued": true,
  l: "warf",
  d: [
   "trocado para => niwany",
   "menina"
  ]
 },
 {
  "discontinued": true,
  l: "fraw",
  d: [
   "trocado para => nawany",
   "menino"
  ]
 },
 {
  "discontinued": true,
  l: "tefh",
  d: [
   "trocado para => nitofh",
   "irmã"
  ]
 },
 {
  "discontinued": true,
  l: "walu",
  d: [
   "trocado para => wa",
   "aquilo"
  ]
 },
 {
  "discontinued": true,
  l: "cunt",
  d: [
   "trocado para => cunk"
  ]
 },
 {
  "discontinued": true,
  l: "egua",
  d: [
   "trocado para => egka"
  ]
 },
 {
  "discontinued": true,
  l: "eigi",
  d: [
   "trocado para => egka"
  ]
 },
 {
  "discontinued": true,
  l: "gofh",
  d: [
   "trocado para => nagefh",
   "pai"
  ]
 },
 {
  "discontinued": true,
  l: "ifol",
  d: [
   "trocado para => rirt",
   "preto"
  ]
 },
 {
  "discontinued": true,
  l: "lefh",
  d: [
   "trocado para => nilofh",
   "madrinha"
  ]
 },
 {
  "discontinued": true,
  l: "lohk",
  d: [
   "trocado para => lopk"
  ]
 },
 {
  "discontinued": true,
  l: "yauh",
  d: [
   "trocado para => rirt",
   "escuridão",
   "escuro"
  ]
 },
 {
  "discontinued": true,
  l: "liyn",
  d: [
   "trocado para => jolo"
  ]
 },
 {
  "discontinued": true,
  l: "slep",
  d: [
   "trocado para => knep"
  ]
 },
 {
  "discontinued": true,
  l: "fylu",
  d: [
   "trocado para => fraq (verifique definição)",
   "que tem interesse de estar perto de semelhantes, do mesmo sexo, ou que se parecem ser do mesmo",
   "atraído por membros do mesmo sexo",
   "homossexual",
   "gay"
  ]
 },
 {
  "discontinued": true,
  l: "grafaw",
  d: [
   "trocado para => woka",
   "outra",
   "outro"
  ]
 }
];

