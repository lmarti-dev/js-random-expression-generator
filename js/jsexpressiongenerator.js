//~ GLOBALS
const var_sym = "$";
const or_sym = "|";

const json_var_key = "vars";
const json_wl_key = "wordlists";
const json_gen_key = "generative";

var source_path = "procedural-generation-word-lists/";
var source_path_wb = "https://dxdt.ch/projects/wordlists/wordlists";
var source_path_gh =
  "https://raw.githubusercontent.com/lmarti-dev/procedural-generation-word-lists/main/";
var source_path_active = source_path_wb;
var wl_manifest;

//~ UTILS

function regex_an(s) {
  // later..
  RegExp.replaceAll(/a ([aioe])/, "an $1");
}

async function fetch_json(url) {
  return await (
    await fetch(url, {
      method: "GET",
    })
  ).json();
}

async function fetch_text(url) {
  return await (
    await fetch(url, {
      method: "GET",
    })
  ).text();
}

function get_random_int(max) {
  return Math.floor(Math.random() * max);
}
function get_random_item_from_array(arr) {
  ind = get_random_int(arr.length);
  return arr[ind];
}

async function get_random_from_wordlist(wl_fname) {
  let wordlist = await fetch_wordlist(wl_fname);
  return get_random_item_from_array(wordlist);
}

function replace_nested_or(str) {
  let re = /\{([^\{\}]+?)\}/g;
  N = 0;
  matches = [...str.matchAll(re)];
  while (matches.length !== 0 && N < 1000) {
    matches = [...str.matchAll(re)];
    matches.forEach(function (e) {
      num_commas = e[1].split(or_sym).length;
      let ind = get_random_int(num_commas);
      choice = e[1].split(or_sym)[ind];
      str = str.replace(e[0], choice);
    });
    N += 1;
  }
  return str;
}

function clean_file_path(str) {
  str = str.split("\\").pop().split("/").pop();
  return str.split(".").shift();
}

function cap_first(str) {
  return str[0].toUpperCase() + str.substring(1);
}
function is_uppercase(char) {
  if (char.toUpperCase() == char) {
    return true;
  } else {
    return false;
  }
}

function strip_html(str) {
  return str.replace(/(<([^>]+)>)/gi, "");
}

async function fetch_wordlist(wl_fname) {
  var response;
  let url = `${source_path_active}wordlists/${wl_fname}`;
  text = await fetch_text(url);
  wordlist = text.split(/\r?\n/);
  return wordlist;
}

function get_option_list_from_array(arr) {
  var opts = [];
  arr.forEach((element) =>
    opts.push(`<option value="${element}">${clean_file_path(element)}</option>`)
  );
  return opts;
}

//~ GENERATE =========================

async function get_random_words(elems, repeat) {
  var random_words = [];
  if (repeat) {
    for (let i = 0; i < elems.length; i++) {
      w = await get_random_from_wordlist(elems[i]);
      random_words.push(w);
    }
  } else {
    // how can js be this bad at simple operations?
    // this is a two-liner in python:
    // d = {k:[] for k in set(elems)}
    // [d[k].append(j) for j,k in zip(range(len(elems)),elems)]
    // profusely sweating programmer meme face

    random_words = Array(elems.length).fill("null");
    unique_wls = [...new Set(elems)];
    obj = Object.fromEntries(unique_wls.map((e) => [e, []]));
    for (var i = 0; i < elems.length; i++) {
      obj[[elems[i]]].push(i);
    }
    let wordlist;
    let idx;
    for (var wl in obj) {
      wordlist = await fetch_wordlist(wl);
      for (var ind in obj[[wl]]) {
        if (wordlist.length == 0) {
          random_words[obj[[wl]][ind]] = "no words left";
        } else {
          idx = get_random_int(wordlist.length);
          random_words[obj[[wl]][ind]] = wordlist[idx];
          wordlist.splice(idx, 1);
        }
      }
    }
  }
  return random_words;
}

async function evaluate_generative_expression(
  varnames,
  wordlists,
  gen_text,
  repeat = true
) {
  let varnames_split = [];
  let wls_split = [];
  for (iii = 0; iii < varnames.length; iii++) {
    if (varnames[iii].includes(",")) {
      let vars = varnames[iii].split(",");
      vars.forEach(function (e, i) {
        varnames_split.push(e);
        wls_split.push(wordlists[iii]);
      });
    } else {
      varnames_split.push(varnames[iii]);
      wls_split.push(wordlists[iii]);
    }
  }
  varnames = varnames_split;
  wordlists = wls_split;

  //~ evaluate the longest variables first to avoid replacing longer ones with shorter ones with same beginning

  zipped_data = varnames.map(function (e, i) {
    return [e, wordlists[i]];
  });
  zipped_data.sort(function (a, b) {
    return b[0].length - a[0].length;
  });

  let text = replace_nested_or(gen_text);
  var random_words = await get_random_words(
    zipped_data.map((e) => {
      return e[1];
    }, repeat)
  );
  zipped_data.forEach(function (e, i) {
    let cur_varname = e[0];
    let cur_wl = e[1];
    let random_word = random_words[i];
    let capped_word;

    if (is_uppercase(cur_varname[0])) {
      capped_word = cap_first(random_word);
    } else {
      capped_word = random_word;
    }
    text = text.replaceAll(var_sym + cur_varname, capped_word);
  });
  return text;
}

async function evaluate_json(data, repeat = true) {
  return await evaluate_generative_expression(
    data[json_var_key],
    data[json_wl_key],
    data[json_gen_key],
    repeat
  );
}

function set_source_path(new_source_path) {
  source_path_active = new_source_path;
}

async function load_wordlist_manifest() {
  //~ LOAD MANIFEST
  wl_manifest = await fetch_json(`${source_path_active}manifest.json`);
}
