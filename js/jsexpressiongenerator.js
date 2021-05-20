
var var_names=[]
var var_exp="var"

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
	var_div.innerHTML="<div class='varsym'>#</div>"
	
	var var_name = document.createElement("input")
	var_name.setAttribute("class","var-input")
	var_name.setAttribute("type","text")
	
	var var_list=document.createElement("select") 
	var_list.setAttribute("name","word list")
	var_list.setAttribute("class","var-select")
	
	var_name.value=var_id
	
	var var_rm = document.createElement("button")
	var_rm.setAttribute("id","rm-"+var_id)
	var_rm.setAttribute("class","rm-button")
	var_rm.innerHTML="╳"
	
	var_div.appendChild(var_name)
	var_div.appendChild(var_list)
	var_div.appendChild(var_rm)
	
	return var_div
}

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