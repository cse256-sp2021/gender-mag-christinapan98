// ---- Define your dialogs  and panels here ----

var idPrefix = 'myId';
//var panel = define_new_effective_permissions(idPrefix);
var panel = define_permission_checkboxes(idPrefix);
var userSelect = define_new_user_select_field(idPrefix, 'select user', on_user_change = function(selected_user){
    //$('#myId').attr('filepath', '/C/presentation_documents/important_file.txt');
    //console.log("hii" + $('#myId').attr('filepath'));
    // why is this undefined???
    $('#myId').attr('username', selected_user);
    
});
$('#sidepanel').append(`<h2>Detailed Permissions</h2>`);
$('#sidepanel').append(`
<p>Here you may view/edit detailed permissions that a given user has to access a specific filepath.</p>
<br/>
<p>To get started, 1) select a filepath from the left panel, then 2) pick a user. (User must be reselected each time a filepath is picked)</p>
<br/>
<p><b>***NOTE:*** Deleting/adding users/changing permission inheritance is done through the left menu! If a checkbox is gray, its permission is being inherited.</b><p/>`);
$('#sidepanel').append(`<br>`);
$('#sidepanel').append(`<span><b>Filepath: </b><span> <span id="panel_filepath"></span>`);
$('#sidepanel').append(userSelect);
$('#sidepanel').append(panel);





//note that options parameter is optional
var dialog = define_new_dialog(idPrefix, title='', options = {});


$('.perm_info').click(function(){
    //console.log("you've been clicked!");
    dialog.empty();
    dialog.dialog('open');
    
    // console.log($(this));
    // console.log($('#myId').attr('filepath'));
    // console.log($('#myId').attr('username'));
    var my_file_obj_var = path_to_file[$('#myId').attr('filepath')];
    let user = all_users[$('#myId').attr('username')];
    var userAction = allow_user_action(my_file_obj_var, user, true, explain_why = true);
    var exText = get_explanation_text(userAction);
    dialog.append(exText); 
});

// var permissions = define_file_permission_groups_list(idPrefix);
// $('#filestructure').append(permissions);
// var userSelect2 = define_new_user_select_field(idPrefix, 'select', on_user_change = function(selected_user){
//     $('#myId').attr('filepath', '/C/presentation_documents/important_file.txt');
//     $('#myId').attr('username', selected_user);
    
// });
// $('#filestructure').append(userSelect2);


//figure out where the info buttons are first
//var my_file_obj_var = path_to_file[my_filename_var];
// let user = all_users[username];

// var userAction = allow_user_action(my_file_obj_var, user, permission_to_check, explain_why = false);
// var exText = get_explanation_text(userAction);

//$(idPrefix).append(exText); 
//did I append this to the right elem?
// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        // let folder_elem = $(`<div class='folder' id="${file_hash}_div">
        //     <h3 id="${file_hash}_header">
        //         <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
        //         <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
        //             <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
        //             <span> Permissions <span>
        //         </button>

        //     </h3>
        // </div>`)
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                    <span> Permissions <span>
                </button>

                <button class="ui-button ui-widget ui-corner-all filebutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span> Select Filepath <span>
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        // return $(`<div class='file'  id="${file_hash}_div">
        //     <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
        //     <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
        //         <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
        //         <span> Permissions <span>
        //     </button>

        // </div>`)
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                <span> Permissions <span>
            </button>

            <button class="ui-button ui-widget ui-corner-all filebutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span> Select Filepath <span>
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    //perm_dialog.dialog('open')
    
    open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

//change the filepath of the effective permissions panel each time this is clicked on
$('.filebutton').click(function(e) {
    let path = e.currentTarget.getAttribute('path');
    $('#myId').attr('filepath', path);
    $('#panel_filepath').text(`${$('#myId').attr('filepath')}`);
    console.log(path);
    console.log('registered as: ' + $('#myId').attr('filepath'));
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 