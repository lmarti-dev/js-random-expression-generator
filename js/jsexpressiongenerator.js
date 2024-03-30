
//~ GLOBALS 
const var_sym = "$"
const or_sym = "|"

const json_var_key = "vars"
const json_wl_key = "wordlists"
const json_gen_key = "generative"


var source_path = "procedural-generation-word-lists/"
var source_path_wb = "../wordlists/"
var source_path_gh = "https://raw.githubusercontent.com/lmarti-dev/procedural-generation-word-lists/main/"
var source_path_active = source_path_wb
var wl_manifest

//~ UTILS 
function get_random_int(max) {
	return Math.floor(Math.random() * max);
}
function get_random_item_from_array(arr) {
	ind = get_random_int(arr.length)
	return arr[ind]
}

function get_random_from_wl(wl_fname) {
	return get_random_item_from_array(ajax_wl(wl_fname))
}

function replace_nested_or(str) {
	let re = /\{([^\{\}]+?)\}/g
	N = 0
	arr = str.matchAll(re)
	while (arr.length !== 0 && N < 1000) {
		matches = [...str.matchAll(re)]
		matches.forEach(function (e) {
			num_commas = e[1].split(or_sym).length
			let ind = get_random_int(num_commas)
			choice = e[1].split(or_sym)[ind]
			str = str.replace(e[0], choice)
		})
		N += 1
	}
	return str
}


function clean_file_path(str) {
	str = str.split('\\').pop().split('/').pop();
	return str.split("\.").shift()
}


function cap_first(str) {
	return str[0].toUpperCase() + str.substring(1)
}
function check_case(char) {
	if (char.toUpperCase() == char) {
		return true;
	}
	else {
		return false
	}
}

function strip_html(str) {
	return str.replace(/(<([^>]+)>)/gi, "");
}

function ajax_wl(wl_fname) {
	let wl_data = []
	let url_fpath = source_path_active + "wordlists/" + wl_fname

	$.ajax(
		{
			url: url_fpath,
			dataType: "html",
			async: false,
			success: function (data) {

				wl_data = data;
			},
		});
	return wl_data.split("\n")
}

function get_option_list_from_array(arr) {
	var opts = []
	arr.forEach(element => opts.push(`<option value="${element}">${clean_file_path(element)}</option>`));
	return opts
}

//~ GENERATE =========================

function evaluate_json(data) {
	let varnames = data[json_var_key]
	let varnames_split = []
	let wls = data[json_wl_key]
	let wls_split = []
	for (iii = 0; iii < varnames.length; iii++) {
		if (varnames[iii].includes(",")) {
			let vars = varnames[iii].split(",")
			vars.forEach(function (e, i) {
				varnames_split.push(e)
				wls_split.push(wls[iii])
			});
		}
		else {
			varnames_split.push(varnames[iii])
			wls_split.push(wls[iii])
		}
	}
	varnames = varnames_split
	wls = wls_split

	//~ evaluate the longest variables first to avoid replacing longer ones with shorter ones with same beginning

	zipped_data = varnames.map(function (e, i) { return [e, wls[i]] })

	zipped_data.sort(function (a, b) { return b[0].length - a[0].length });

	let text = replace_nested_or(data[json_gen_key])
	zipped_data.forEach(function (e, i) {
		let cur_varname = e[0]
		let cur_wl = e[1]

		let random_word = get_random_from_wl(cur_wl)

		if (check_case(cur_varname[0])) {
			text = text.replaceAll(var_sym + cur_varname, cap_first(random_word))
		}
		else {
			text = text.replaceAll(var_sym + cur_varname, random_word)
		}

	});
	return text
}


function set_source_path(new_source_path) {
	source_path_active = new_source_path
}

async function load_wordlist_manifest() {
	//~ LOAD MANIFEST 

	return await $.ajax(
		{
			url: source_path_active + "manifest.json",
			mimeType: "json",
			async: false,
			success: function (data) {
				wl_manifest = data;
			}
		});
}