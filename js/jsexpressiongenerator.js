
//~ GLOBALS 

var int_vars_reg=[]
var var_exp="x"
var status_good_color = "#4DAC27"	
var status_bad_color = "#DA1400"
var status_info_color = "#0055FF"
var var_sym = "$"
var or_sym="|"
var copied_str = ""

var source_path = "procedural-generation-word-lists/"
var source_path_wb = "../wordlists/"
var source_path_gh = "https://raw.githubusercontent.com/lmarti-dev/procedural-generation-word-lists/main/"
var source_path_active = source_path_wb
var wl_manifest
var can_generate=false

//~ UTILS 
function get_random_int(max) {
	return Math.floor(Math.random() * max);
}
function get_random_item_from_array(arr){
	ind = get_random_int(arr.length)
	return arr[ind]
}

function get_random_from_wl(wl_fname){
	return get_random_item_from_array(ajax_wl(wl_fname))
}

function replace_nested_or(str){
	let re=/\{([^\{\}]+?)\}/g
	N=0
	while (str.matchAll(re) !== [] && N < 1000) {
		matches = [...str.matchAll(re)]
		matches.forEach(function(e){
			num_commas=e[1].split(or_sym).length
			let ind = get_random_int(num_commas)
			choice=e[1].split(or_sym)[ind]
			str = str.replace(e[0],choice)
		})
		N+=1
	}
	return str
}


function clean_file_path(str) {
    str = str.split('\\').pop().split('/').pop();
    return str.split("\.").shift()
}

function get_var_name() {
	var var_len = int_vars_reg.length
	var var_num = var_len
	var var_name = var_exp + var_num
	while (int_vars_reg.includes(var_name)){
		var_num++
		var_name = var_exp + var_num
	}
	int_vars_reg.push(var_name)
	return var_name
}

function cap_first(str) {
	return str[0].toUpperCase() + str.substring(1) 
}
function check_case(char){
	if (char.toUpperCase() == char) {
		return true;
	}
	else {
		return false
	}
}

function strip_html(str){
	return str.replace(/(<([^>]+)>)/gi, "");
}

function ajax_wl(wl_fname){
	let wl_data = []
	let url_fpath = source_path_active + "wordlists/" + wl_fname
	
	$.ajax(
	{
		url: url_fpath,
		dataType: "html",
		async: false,
		success: function(data)
		{
			
			wl_data = data;
		},
	});	
	return wl_data.split("\n")
}

function get_option_list_from_array(arr){
	var opts = []
	arr.forEach(element => opts.push(`<option value="${element}">${clean_file_path(element)}</option>`));
	return opts
}

function clear_all(){
		$("#var-list").html("")
		$("#gen-text").val("")
		$("#results").empty()
		int_vars_reg=[]
}
//~ ADD VARIABLE 

function add_var_div(var_id,selected_option){
	
	
	var var_div = document.createElement("div")
	var_div.setAttribute("class","var-div")
	var_div.setAttribute("id",var_id)
	var_div.innerHTML="<div class='varsym'>"+var_sym+"</div>"
	
	var var_name = document.createElement("input")
	var_name.setAttribute("class","var-elem")
	var_name.setAttribute("id","input-"+var_id)
	var_name.setAttribute("type","text")
	var_name.setAttribute("minlength","1")
	var_name.setAttribute("pattern",'(\\w{1,5},{1}){1,}\\w{1,5}|\\w{1,5}')
	var_name.required=true;
	var_name.value=var_id
	
	var wl_select=document.createElement("select") 
	wl_select.setAttribute("name","word list")
	wl_select.setAttribute("class","var-elem")
	wl_select.setAttribute("id","select-"+var_id)
	wl_select.innerHTML = wl_options
	wl_select.value = selected_option
	
	
	var var_rm = document.createElement("button")
	var_rm.setAttribute("id","rm-"+var_id)
	var_rm.setAttribute("class","rm-button")
	var_rm.innerHTML="╳"
	
	var_div.appendChild(var_name)
	var_div.appendChild(wl_select)
	var_div.appendChild(var_rm)
	
	return var_div
}

function add_new_var(var_id=get_var_name(),selected_option=wl_manifest[0]){
	let new_var_div = add_var_div(var_id,selected_option)
	$("#var-list").append(new_var_div)
	$("#var-list").on("click",".rm-button",function(){
		this.parentNode.remove()
	})
	return new_var_div
};
$("#add-var").click(function(){
	add_new_var()
})
$("#reset-var").click(function(){
	clear_all()
})

//~ LOAD MANIFEST 

$.ajax(
	{
		url: source_path_active + "manifest.json",
		dataType: "json",
		async: false,
		success: function(data)
		{
			wl_manifest = data;
		}
	});



var wl_options=[]
wl_options = get_option_list_from_array(wl_manifest)

//~ LOAD EXAMPLES

var examples 
var examples_manifest 
var examples_options

$.ajax(
	{
		url: "examples/manifest.json",
		dataType: "json",
		async: false,
		success: function(data)
		{
			examples_manifest = data;
			
		}
	});

examples_options = get_option_list_from_array(examples_manifest)
$("#ie-panel-examples").html(examples_options)

$("#ie-panel-load-button").click(function(){
	let example_fpath = $("#ie-panel-examples").val()
	let example_json
	$.ajax(
	{
		url: "examples/" + example_fpath,
		dataType: "text",
		async: false,
		success: function(data)
		{
			example_json = data;
		}
	});
	//~ console.log(example_json)
	$("#ie-text").val(example_json)
});
	

function get_multiple_inputs(query){
	let values = $(query).map(function(idx,elem) {
		//~ inverted implementation of argument order
		return $(elem).val();
	})
	//~ console.log($(query))
	return Array.from(values)
	
}
function get_all_results(){
	let values = $(".result").map(function(idx,elem) {
		//~ inverted implementation of argument order
		return elem.firstChild.innerHTML;
	})
	//~ console.log(values)
	return Array.from(values)
	
}

function get_stripped_gen_text(){
	return strip_html(document.getElementById("gen-text").value)
}

//~ GENERATE =========================

$("#generate").click(function(){
	$("#results").empty()
	if (can_generate){
		$("#results").html("")
		
		let varnames = get_multiple_inputs('[id^="input-"]')
		let varnames_split=[]
		let wls = get_multiple_inputs('[id^="select-"]')
		let wls_split=[]
		for (iii=0;iii<varnames.length;iii++){
			if (varnames[iii].includes(",")) {
				let vars = varnames[iii].split(",")
				vars.forEach(function(e,i){
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
		
		zipped_data = varnames.map(function(e,i){return [e,wls[i]]})
		
		zipped_data.sort(function(a, b){return b[0].length - a[0].length});
		
		//~ console.log(zipped_data)
		
		let num_gens=$("#numgens").val()
		for (iii=0;iii<num_gens;iii++){
			let text=replace_nested_or(get_stripped_gen_text())
			zipped_data.forEach(function(e, i) {
				let cur_varname = e[0]
				let cur_wl = e[1]
				
				let random_word = get_random_from_wl(cur_wl)
				
				if (check_case(cur_varname[0])){
					text=text.replaceAll(var_sym + cur_varname, cap_first(random_word))
				}
				else {
					text=text.replaceAll(var_sym + cur_varname, random_word)
				}
				
			});
			let result = $("<div class='result'></div>")
			result.html("<p>"+text+"</p>")
			result.append("<button class='copy'>Copy</button>")
			$("#results").append(result)
		}
		$("#results").on("click",".copy",function(){
			copy_to_clip(this.parentNode.firstElementChild.innerHTML)
		})
		$("#copy-all").click(function(){
			copy_to_clip(get_all_results())
		});
	}
})

//~ UPADTE STATUS ==================================

var app = document.getElementById("expgenapp")
app.addEventListener('input', update_ui);
app.addEventListener('click', update_ui);
var can_generate = false

function highlight_vars(e){
	let text = get_stripped_gen_text()
	let varnames = get_multiple_inputs('[id^="input-"]')
	varnames.forEach(function(e, i) {
		varname=var_sym + e
		text=text.replace(varname, "<code>" + varname + "</code>")	
	});
	document.getElementById("gen-text").innerHTML=text
	
}

function update_ui(e){
	//~ highlight_vars(e)
	//~ try and imitate the outlook contact highlighting
	update_message(e)
	if ($("#results").children().length > 1){
		$("#copy-all").removeClass("hidden")
	} else {
		$("#copy-all").addClass("hidden")
	}
}


function update_status_message(str,color){
	let msg = $("<div></div>")
	msg.attr("class","status-msg")
	msg.html(str.toUpperCase())
	msg.css("background-color", color)
	$('#status-ribbon').append(msg)
}


function update_message(e){
	$('#status-ribbon').html("")
	inputs=document.querySelectorAll("input,textarea")
	var bad_var=false
	var null_var=false
	var no_vars=false
	can_generate=false
	
	inputs.forEach(function(e) {
		if (e.value === "" && e.required) {
			null_var=true
		}
		else if (!e.checkValidity()) {
			bad_var=true
		}
		let varnames = document.querySelector('[id^="input-"]')
		if (!varnames) {
			no_vars=true
		}
	})
	
	
	if (null_var){update_status_message("empty field",status_bad_color)}
	
	if (bad_var){update_status_message("invalid variable",status_bad_color)}
	
	if (no_vars){update_status_message("no variables",status_info_color)}

	if (!null_var && !bad_var){
		update_status_message("no input validation error",status_good_color)
		can_generate=true;
	}
}

//~ COPY ==========================0

function copy_to_clip(str) {
	copied_str=str
	document.execCommand('copy');
};

document.addEventListener('copy', function(e) {
	origin = e.explicitOriginalTarget;
	if (origin.id === "copy-all" || $(origin).hasClass('copy')){
		e.clipboardData.setData('text/plain', copied_str);
		e.clipboardData.setData('text/html', copied_str);
		e.preventDefault()
	}
})	


//~ HELP PANEL ==================================

function show_hide_panel(button,panel) {
	if (panel.hasClass("hidden")){
		panel.removeClass("hidden")
		button.click(function() {
			panel.addClass("hidden")
		})
	} else {
		panel.addClass("hidden")
	}
}

var help_button = $("#help-button")
var help_panel = $("#help-panel")
var help_panel_close_button = $("#help-panel-close-button")


function show_hide_help_panel(){
	show_hide_panel(help_panel_close_button,help_panel)
}

help_button.click(show_hide_help_panel)

//~ IE PANEL ==================================

var ie_button = $("#ie-button")
var ie_panel = $("#ie-panel")
var ie_panel_close_button =  $("#ie-panel-close-button")

var json_var_key="vars"
var json_wl_key="wordlists"
var json_gen_key="generative"

function import_gen_text(){
	
	if ($("#ie-text").val() !== ""){
		data=JSON.parse($("#ie-text").val())
	
		clear_all()
		let varnames=data[json_var_key]
		let wls=data[json_wl_key]
		let gen_text=data[json_gen_key]
		
		varnames.forEach(function(e,i){
			add_new_var(e,wls[i])
		});
		$("#gen-text").val(gen_text)
		$("#ie-text").val("")
		show_hide_ie_panel()
	} else {
		console.log("Empty import!")
	}
	
}



function export_gen_text(){
	let varnames=get_multiple_inputs("#var-list input")
	let wls=get_multiple_inputs("#var-list select")
	//~ console.log(varnames)
	//~ console.log(wls)
	let gen_text = $("#gen-text").val()
	//~ console.log(gen_text)
	json_export={[json_var_key]:varnames,[json_wl_key]:wls,[json_gen_key]:gen_text}
	var json_export = JSON.stringify(json_export,null, 3)
	$("#ie-text").empty()
	$("#ie-text").val(json_export)
	
}

function show_hide_ie_panel(){
	show_hide_panel(ie_panel_close_button,ie_panel)
	$("#ie-panel-import-button").click(import_gen_text)
	$("#ie-panel-export-button").click(export_gen_text)
}

ie_button.click(function(){
	show_hide_ie_panel()
	$("#ie-text").empty()
});


