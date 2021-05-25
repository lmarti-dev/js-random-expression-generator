
var int_vars_reg=[]
var var_exp="var"
var status_good_color = "#4DAC27"	
var status_bad_color = "#DA1400"
var status_info_color = "#49BEED"
var var_sym = "$"
var copied_str = ""

function copy_to_clip(str) {
	copied_str=str
	document.execCommand('copy');
};

function get_random_int(max) {
	return Math.floor(Math.random() * max);
}


function replace_nested_or(str){
	let re=/\{([^\{\}]+?)\}/g
	N=0
	while (str.matchAll(re) !== [] && N < 100) {
		matches = [...str.matchAll(re)]
		matches.forEach(function(e){
			num_commas=e[1].split(",").length
			let ind = get_random_int(num_commas)
			choice=e[1].split(",")[ind]
			str = str.replace(e[0],choice)
		})
		N+=1
	}
	return str
}


function get_file_from_path(str) {
    return str.split('\\').pop().split('/').pop();
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

function add_var_div(){
	
	var_id=get_var_name()
	
	var var_div = document.createElement("div")
	var_div.setAttribute("class","var-div")
	var_div.setAttribute("id",var_id)
	var_div.innerHTML="<div class='varsym'>"+var_sym+"</div>"
	
	var var_name = document.createElement("input")
	var_name.setAttribute("class","var-elem")
	var_name.setAttribute("id","input-"+var_id)
	var_name.setAttribute("type","text")
	var_name.setAttribute("minlength","1")
	var_name.setAttribute("pattern",'\\w{1,15}')
	var_name.required=true;
	
	var wl_select=document.createElement("select") 
	wl_select.setAttribute("name","word list")
	wl_select.setAttribute("class","var-elem")
	wl_select.setAttribute("id","select-"+var_id)
	wl_select.innerHTML = wl_options
	var_name.value=var_id
	
	var var_rm = document.createElement("button")
	var_rm.setAttribute("id","rm-"+var_id)
	var_rm.setAttribute("class","rm-button")
	var_rm.innerHTML="╳"
	
	var_div.appendChild(var_name)
	var_div.appendChild(wl_select)
	var_div.appendChild(var_rm)
	
	return var_div
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
function get_random_item_from_array(arr){
	ind = get_random_int(arr.length)
	return arr[ind]
}

function get_random_from_wl(wl_fname){
	return get_random_item_from_array(ajax_wl(wl_fname))
}

var source_path = "procedural-generation-word-lists/"
var source_path_gh = "https://raw.githubusercontent.com/lmarti-dev/procedural-generation-word-lists/main/"
var source_path_active = source_path_gh
var manifest
var can_generate=false

$.ajax(
{
    url: source_path_active + "manifest.json",
    dataType: "json",
    async: false,
    success: function(data)
    {
        manifest = data;
    }
});

var wl_options=[]
manifest.forEach(element => wl_options.push(`<option value="${element}">${get_file_from_path(element)}</option>`));


$("#add-var").click(function(){
		let new_var_div = add_var_div()
		$("#var-list").append(new_var_div)
		$("#var-list").on("click",".rm-button",function(){
			this.parentNode.remove()
		})
	})
$("#reset-var").click(function(){
		$("#var-list").html("")
		int_vars_reg=[]
	})


function get_multiple_inputs(query){
	let values = $(query).map(function(idx,elem) {
		//~ clown world implementation of argument order
		return $(elem).val();
	})
	return Array.from(values)
	
}

function get_stripped_gen_text(){
	return strip_html(document.getElementById("gen-text").value)
}

$("#generate").click(function(){
	if (can_generate){
		$("#results").html("Generating...")
		$("#results").html("")
		
		let varnames = get_multiple_inputs('[id^="input-"]')
		let wls = get_multiple_inputs('[id^="select-"]')
		let num_gens=$("#numgens").val()
		for (iii=0;iii<num_gens;iii++){
			let text=replace_nested_or(get_stripped_gen_text())
			varnames.forEach(function(e, i) {
				
				let random_word = get_random_from_wl(wls[i])
				
				if (check_case(e[0])){
					text=text.replaceAll(var_sym + e, cap_first(random_word))
				}
				else {
					text=text.replaceAll(var_sym + e, random_word)
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
	}
})


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

	
	inputs.forEach(function(e) {
		if (e.value === "") {
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

document.addEventListener('copy', function(e) {
	e.clipboardData.setData('text/plain', copied_str);
	e.clipboardData.setData('text/html', copied_str);
	e.preventDefault();
})	