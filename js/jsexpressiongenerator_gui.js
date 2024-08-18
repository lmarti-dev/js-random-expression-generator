
//~ GLOBALS 

var int_vars_reg = []
var var_exp = "x"
var status_good_color = "#4DAC27"
var status_bad_color = "#DA1400"
var status_info_color = "#0055FF"
var copied_str = ""

var wl_options = []
var can_generate = false

function get_var_name() {
	var var_len = int_vars_reg.length
	var var_num = var_len
	var var_name = var_exp + var_num
	while (int_vars_reg.includes(var_name)) {
		var_num++
		var_name = var_exp + var_num
	}
	int_vars_reg.push(var_name)
	return var_name
}


function clear_all() {
	document.getElementById("var-list").innerHTML = ""
	document.getElementById("gen-text").value = ""
	document.getElementById("results").innerHTML = ""
	int_vars_reg = []
}
//~ ADD VARIABLE 

function add_var_div(var_id, selected_option) {
	var var_div = document.createElement("div")
	var_div.setAttribute("class", "var-div")
	var_div.setAttribute("id", var_id)
	var_div.innerHTML = "<div class='varsym'>" + var_sym + "</div>"

	var var_name = document.createElement("input")
	var_name.setAttribute("class", "var-elem")
	var_name.setAttribute("id", "input-" + var_id)
	var_name.setAttribute("type", "text")
	var_name.setAttribute("minlength", "1")
	var_name.setAttribute("pattern", '(\\w{1,5},{1}){1,}\\w{1,5}|\\w{1,5}')
	var_name.required = true;
	var_name.value = var_id

	var wl_select = document.createElement("select")
	wl_select.setAttribute("name", "word list")
	wl_select.setAttribute("class", "var-elem")
	wl_select.setAttribute("id", "select-" + var_id)
	wl_select.innerHTML = wl_options
	wl_select.value = selected_option


	var var_rm = document.createElement("button")
	var_rm.setAttribute("id", "rm-" + var_id)
	var_rm.setAttribute("class", "rm-button")
	var_rm.innerHTML = "╳"

	var_div.appendChild(var_name)
	var_div.appendChild(wl_select)
	var_div.appendChild(var_rm)

	return var_div
}

function add_new_var(var_id = get_var_name(), selected_option = wl_manifest[0]) {
	let new_var_div = add_var_div(var_id, selected_option)
	document.getElementById("var-list").appendChild(new_var_div)
	let rm_buttons = document.getElementsByClassName("rm-button")
	Array.from(rm_buttons).map((element) => {
		element.addEventListener("click", function () {
			// check this
			element.parentNode.remove()
		})
	})
	return new_var_div
};

//~ LOAD MANIFEST 




function get_multiple_inputs(query) {
	query_results = document.querySelectorAll(query)
	let values = Array.from(query_results).map(function (elem) {
		//~ inverted implementation of argument order
		return elem.value;
	})
	return Array.from(values)

}
function get_all_results() {
	let results = document.getElementsByClassName("result")
	let values = Array.from(results).map(function (elem) {
		//~ inverted implementation of argument order
		return elem.firstChild.innerHTML;
	})
	return Array.from(values)

}

function get_stripped_gen_text() {
	return strip_html(document.getElementById("gen-text").value)
}

//~ GENERATE =========================

async function append_result_child(wls, varnames, gen_text) {
	var results_div = document.getElementById("results")
	text = await evaluate_generative_expression(varnames, wls, gen_text)
	let result = document.createElement("div")
	result.classList.add("result")
	result.innerHTML = "<p>" + text + "</p>"
	button = document.createElement("button")
	button.innerHTML = "Copy"
	button.classList.add("copy")
	result.appendChild(button)
	results_div.appendChild(result)

}

function setup_generate() {

	document.getElementById("generate").addEventListener("click", function () {
		var results_div = document.getElementById("results")
		results_div.innerHTML = ""
		if (can_generate) {
			results_div.innerHTML = ""
			let varnames = get_multiple_inputs('[id^="input-"]')
			let wls = get_multiple_inputs('[id^="select-"]')
			let gen_text = get_stripped_gen_text()
			let num_gens = document.getElementById("numgens").value
			for (let iii = 0; iii < num_gens; iii++) {
				append_result_child(wls, varnames, gen_text)
			}
			Array.from(results_div.getElementsByClassName("copy")).map((element) => {
				element.addEventListener("click", function () {

					// check this
					copy_to_clip(element.parentNode.firstElementChild.innerHTML)
				})
			})
			document.getElementById("copy-all").addEventListener("click", function () {
				copy_to_clip(get_all_results())
			});
		}
	})
}


function highlight_vars(e) {
	let text = get_stripped_gen_text()
	let varnames = get_multiple_inputs('[id^="input-"]')
	varnames.forEach(function (e, i) {
		varname = var_sym + e
		text = text.replace(varname, "<code>" + varname + "</code>")
	});
	document.getElementById("gen-text").innerHTML = text

}

function update_ui(e) {
	//~ highlight_vars(e)
	//~ try and imitate the outlook contact highlighting
	update_message(e)
	if (document.getElementById("results").children.length > 1) {
		document.getElementById("copy-all").classList.remove("hidden")
	} else {
		document.getElementById("copy-all").classList.add("hidden")
	}

}


function update_status_message(str, color) {
	let msg = document.createElement("div")
	msg.classList.add("status-msg")
	msg.innerHTML = str.toUpperCase()
	msg.style["background-color"] = color
	document.getElementById('status-ribbon').appendChild(msg)
}


function update_message(e) {
	document.getElementById('status-ribbon').innerHTML = ""
	inputs = document.querySelectorAll("input,textarea")
	var bad_var = false
	var null_var = false
	var no_vars = false
	can_generate = false

	inputs.forEach(function (e) {
		if (e.value === "" && e.required) {
			null_var = true
		}
		else if (!e.checkValidity()) {
			bad_var = true
		}
		let varnames = document.querySelector('[id^="input-"]')
		if (!varnames) {
			no_vars = true
		}
	})


	if (null_var) { update_status_message("empty field", status_bad_color) }

	if (bad_var) { update_status_message("invalid variable", status_bad_color) }

	if (no_vars) { update_status_message("no variables", status_info_color) }

	if (!null_var && !bad_var) {
		update_status_message("no input validation error", status_good_color)
		can_generate = true;
	}
}

//~ COPY ==========================0

function copy_to_clip(str) {
	copied_str = str
	document.execCommand('copy');
};

document.addEventListener('copy', function (e) {
	origin = e.explicitOriginalTarget;
	if (origin.id === "copy-all" || origin.classList.contains('copy')) {
		e.clipboardData.setData('text/plain', copied_str);
		e.clipboardData.setData('text/html', copied_str);
		e.preventDefault()
	}
})

//~ HELP PANEL ==================================

function show_hide_panel(button, panel) {
	if (panel.classList.contains("hidden")) {
		panel.classList.remove("hidden")
		button.addEventListener("click", function () {
			panel.classList.add("hidden")
		})
	} else {
		panel.classList.add("hidden")
	}
}

function show_hide_help_panel() {
	show_hide_panel(document.getElementById("help-panel-close-button"), document.getElementById("help-panel"))
}

function import_gen_text() {

	if (document.getElementById("ie-text").value !== "") {
		data = JSON.parse(document.getElementById("ie-text").value)

		clear_all()
		let varnames = data[json_var_key]
		let wls = data[json_wl_key]
		let gen_text = data[json_gen_key]

		varnames.forEach(function (e, i) {
			add_new_var(e, wls[i])
		});
		document.getElementById("gen-text").value = gen_text
		document.getElementById("ie-text").innerHTML =
			show_hide_ie_panel()
		update_ui()
	} else {
		console.log("Empty import!")
	}

}

function export_gen_text() {
	let varnames = get_multiple_inputs("#var-list input")
	let wls = get_multiple_inputs("#var-list select")
	//~ console.log(varnames)
	//~ console.log(wls)
	let gen_text = document.getElementById("gen-text").value
	//~ console.log(gen_text)
	json_export = { [json_var_key]: varnames, [json_wl_key]: wls, [json_gen_key]: gen_text }
	var json_export = JSON.stringify(json_export, null, 3)
	document.getElementById("ie-text").value = ""
	document.getElementById("ie-text").value = json_export

}

function show_hide_ie_panel() {
	show_hide_panel(document.getElementById("ie-panel-close-button"), document.getElementById("ie-panel"))
	document.getElementById("ie-panel-import-button").addEventListener("click", import_gen_text)
	document.getElementById("ie-panel-export-button").addEventListener("click", export_gen_text)
}



async function setup_gui() {
	var help_button = document.getElementById("help-button")
	var help_panel = document.getElementById("help-panel")
	var help_panel_close_button = document.getElementById("help-panel-close-button")

	help_button.addEventListener("click", show_hide_help_panel)

	//~ IE PANEL ==================================

	var ie_button = document.getElementById("ie-button")
	var ie_panel = document.getElementById("ie-panel")
	var ie_panel_close_button = document.getElementById("ie-panel-close-button")

	document.getElementById("add-var").addEventListener("click", function () {
		add_new_var()
	})
	document.getElementById("reset-var").addEventListener("click", function () {
		clear_all()
	})

	ie_button.addEventListener("click", function () {
		show_hide_ie_panel()
		document.getElementById("ie-text").innerHTML = ""
	});

	// get wl_manifest
	await load_wordlist_manifest()
	wl_options = get_option_list_from_array(wl_manifest)

	setup_generate()
	//~ LOAD EXAMPLES
	var examples
	var examples_options
	var examples_manifest = await fetch_json("examples/manifest.json")
	examples_options = get_option_list_from_array(examples_manifest)
	document.getElementById("ie-panel-examples").innerHTML = examples_options

	document.getElementById("ie-panel-load-button").addEventListener("click", async function () {
		let example_fpath = document.getElementById("ie-panel-examples").value
		let example_json
		example_json = await fetch_json(`examples/${example_fpath}`)
		document.getElementById("ie-text").value = JSON.stringify(example_json, null, 2)
	})

	//~ UPDATE STATUS ==================================

	var app = document.getElementById("expgenapp")
	app.addEventListener('input', update_ui);
	app.addEventListener('click', update_ui);
	var can_generate = false
}



document.addEventListener('DOMContentLoaded', (event) => {
	setup_gui()
});