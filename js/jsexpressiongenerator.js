
var var_names=[]
var var_exp="var"
var status_good_color = "#4DAC27"	
var status_bad_color = "#DA1400"
var status_info_color = "#49BEED"
var var_sym = "$"

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
			console.log(num_commas)
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
	var var_len = var_names.length
	var var_num = var_len
	var var_name = var_exp + var_num
	while (var_names.includes(var_name)){
		var_num++
		var_name = var_exp + var_num
	}
	var_names.push(var_name)
	return var_name
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

var source_path = "procedural-generation-word-lists/"
var source_path_gh = "https://raw.githubusercontent.com/lmarti-dev/procedural-generation-word-lists/main/"
var manifest

$.ajax(
{
    url: source_path_gh + "manifest.json",
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
		var_names=[]
	})

$("#generate").click(function(){
	if (can_generate){
		let varnames = document.querySelectorAll('[id^="input-"]')	
		let wls = $('[id^="select-"]')
		let gen_text=document.getElementById("gen-text").value
		let pairs = wls.map(function(e, i) {
			return [e, varnames[i]];
		});
		
	}
})


var app = document.getElementById("expgenapp")
app.addEventListener('input', update_message);
app.addEventListener('click', update_message);
var can_generate = false

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
	var can_generate=false
	
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
