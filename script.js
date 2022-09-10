//===== Globals variables =====
if(screen.width>=961){
    var DesktopMode=true;
}
else{
    var DesktopMode=false;
}

//=== Accueil ===
var homeContent=document.getElementById("home"); //Main

var BTN_launchApp=document.getElementById("btn-launchApp");
var AppFlipFlop=true;
//======

//=== App ===
var lastPlaylistUsed;

var appGlobal=document.getElementById("app"); //Main

var appMenu=document.getElementById("app-menu");
var BTN_appMenu_OPEN=document.getElementById("btn-app-menu");
var BTN_appMenu_CLOSE=document.getElementById("app-menu-close");

var SELECT_appMenu_sort=document.getElementById("app-playlist-sort");

var appContent=document.getElementById("app-content");

var appCoverSelectionner=document.getElementById("app-selectionner");
var visualize_appCoverSelectionner=document.getElementById("selectionner-visualize");
var list_appCoverSelectionner=document.getElementById("selectionner-select_list");
var INPUT_appCoverSelectionner_SEARCH=document.getElementById("selectionner-textarea");

var CoversQuality=3;
//======

//==========


//===== Accueil =====
function AppSwitch(){
    if(AppFlipFlop){
        AppFlipFlop=!AppFlipFlop;

        appGlobal.style.display="block";
        appGlobal.style.visibility="visible";

        homeContent.style.display="none";
        homeContent.style.visibility="hidden";
    }
    else{
        AppFlipFlop=!AppFlipFlop;
        
        homeContent.style.display="flex";
        homeContent.style.visibility="visible";

        appGlobal.style.display="none";
        appGlobal.style.visibility="hidden";
    }
}

BTN_launchApp.addEventListener('click', (event) => {
    AppSwitch();
});

var BTN_launchApp_sentences=[
    "Start your adventure !",
    "Follow the arrow !",
    "Let's make !",
    "Click me to start !",
    "Let's start !",
    "I want my grid !",
]
if(DesktopMode){
    BTN_launchApp_sentences.push("Create my desktop wallpaper !");
}
else{
    BTN_launchApp_sentences.push("My phone wallpaper !");
}
BTN_launchApp.innerHTML=BTN_launchApp_sentences[Math.floor(Math.random()*BTN_launchApp_sentences.length)]+"  <i class='fa-solid fa-arrow-right'></i>";
//==========





//===== App =====

//=== Menu ===
//= Menu Opening/Closure =
BTN_appMenu_OPEN.addEventListener('click', (event) => {
    appMenu.style.visibility="visible";
    if(screen.width>=961){
        appMenu.style.right="75%";
    }
    else{
        appMenu.style.right="0";
    }
});
BTN_appMenu_CLOSE.addEventListener('click', (event) => {
    appMenu.style.right="100%";
    appMenu.style.visibility="hidden";
});


//= Spotify integration =
let trackLimit=100

const _getTokenSpotify = async () => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa("84d18b8414d341ac955361219c178813" + ':' + "025864421624491990d474426b484749")
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

async function getJsonPlaylistSpotify(playlistID, offset) {
    let token=await _getTokenSpotify()
    let response = await fetch('https://api.spotify.com/v1/playlists/'+playlistID+ "/tracks?limit="+trackLimit+"&offset="+offset, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer '+token}
    })
    let data = await response.json()
    return data;
}

async function SpotifyPlaylist(){
    let LoopsNeeded=1;

    let playlistID=TEXT_appMenu_SPOTIFY.value.split("/");
    playlistID=playlistID[playlistID.length-1];
    playlistID=playlistID.split("?")[0];
    let playlistData=await getJsonPlaylistSpotify(playlistID, 0);

    if(playlistData.total>trackLimit){
        LoopsNeeded=Math.trunc(playlistData.total/trackLimit)+1;
    }

    let playlistUrls=[];
    for(let l=0; l<LoopsNeeded; l++){
        let playlistData=await getJsonPlaylistSpotify(playlistID, l*trackLimit);
        let playlistItems=playlistData.items;
        
        for(let i=0; i<playlistItems.length; i++){
            if(playlistItems[i].track==null || playlistUrls.includes(playlistItems[i].track.album.images[0].url)) continue;
            playlistUrls.push(playlistItems[i].track.album.images[0].url)
        }
    }

    if(SELECT_appMenu_sort.value=="0"){
        for (let i = playlistUrls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = playlistUrls[i];
            playlistUrls[i] = playlistUrls[j];
            playlistUrls[j] = temp;
        }
    }   
    else if(SELECT_appMenu_sort.value=="2"){
        playlistUrls=playlistUrls.reverse();
    }  

    for(let c=0; c<playlistUrls.length && c<appContent.children.length; c++){
        var cover = document.createElement("img");
        var cover=new Image();
        cover.crossOrigin="anonymous";
        cover.src=playlistUrls[c];
        appContent.children[c].innerHTML="";
        appContent.children[c].appendChild(cover).className="grid-cell-cover";
    }
}

var TEXT_appMenu_SPOTIFY = document.getElementById("app-spotify-playlist");
TEXT_appMenu_SPOTIFY.addEventListener("change", async function(e){
    if(TEXT_appMenu_SPOTIFY.value.length>0){
        SpotifyPlaylist();
        lastPlaylistUsed="spotify";
    }
});



//= Deezer integration =
async function getJsonPlaylistDeezer(playlistID, offset) {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.deezer.com/playlist/'+playlistID+ "/tracks?index="+offset+"&limit="+trackLimit, {
        method: 'GET',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json',
    })
    let data = await response.json()
    return data;
}

async function DeezerPlaylist(){
    let LoopsNeeded=1;

    let playlistID=TEXT_appMenu_DEEZEER.value.split("/");
    playlistID=playlistID[playlistID.length-1];
    playlistID=playlistID.split("?")[0];
    let playlistData=await getJsonPlaylistDeezer(playlistID, 0);

    if(playlistData.total>trackLimit){
        LoopsNeeded=Math.trunc(playlistData.total/trackLimit)+1;
    }

    let playlistUrls=[];
    for(let l=0; l<LoopsNeeded; l++){
        let playlistData=await getJsonPlaylistDeezer(playlistID, l*trackLimit);
        let playlistItems=playlistData.data;

        for(let i=0; i<playlistItems.length; i++){
            if(playlistUrls.includes(playlistItems[i].album.cover_big)) continue;
            playlistUrls.push(playlistItems[i].album.cover_big)
        }
    }

    if(SELECT_appMenu_sort.value=="0"){
        for (let i = playlistUrls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = playlistUrls[i];
            playlistUrls[i] = playlistUrls[j];
            playlistUrls[j] = temp;
        }
    }   
    else if(SELECT_appMenu_sort.value=="2"){
        playlistUrls=playlistUrls.reverse();
    }   

    for(let c=0; c<playlistUrls.length && c<appContent.children.length; c++){
        var cover = document.createElement("img");
        var cover=new Image();
        cover.crossOrigin="anonymous";
        cover.src=playlistUrls[c];
        appContent.children[c].innerHTML="";
        appContent.children[c].appendChild(cover).className="grid-cell-cover";
    }
}

var TEXT_appMenu_DEEZEER = document.getElementById("app-deezer-playlist");
TEXT_appMenu_DEEZEER.addEventListener("change", async function(e){
    if(TEXT_appMenu_DEEZEER.value.length>0){
        DeezerPlaylist();
        lastPlaylistUsed="deezer";
    }
});



//= Settings =
//Sort
SELECT_appMenu_sort.addEventListener("change", function(e) {
    if (lastPlaylistUsed=="spotify") SpotifyPlaylist();
    else if(lastPlaylistUsed="deezer") DeezerPlaylist();
});


//Columns Value
if(DesktopMode){
    var GridRows=4+1
    var GridColumns=((GridRows-1)*2)
}
else{
    var GridColumns=4
    var GridRows=(GridColumns*2)+1
}


var root = document.querySelector(':root');
root.style.setProperty('--grid-cols', GridColumns.toString());

function makeRows(cellNumber) {
    let Cell_HoldingTimeout;
    let Cell_LongTouch;
    let Cell_LongSelected=null;

    if(cellNumber>0){
        for(let c=0; c<cellNumber; c++) {
            let cell = document.createElement("div");
            cell.innerHTML="+";
            cell.setAttribute("data-id", (c+1))
            appContent.appendChild(cell).className="grid-cell";
          };

        //Changement des ids
        for (let i = 0; i<appContent.children.length; i++) {
            appContent.children[i].setAttribute("data-id", i+1);
        }
    }
    else{
        for(let c=0; c>cellNumber; c--) {
            appContent.removeChild(appContent.lastElementChild);
        }  
    }
    root.style.setProperty('--grid-cols', GridColumns);


    //=== Apply new cells events ===
    for (let i = 0; i < appContent.children.length; i++) {
        let newCell=appContent.children[i].cloneNode(true);

        newCell.oncontextmenu = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
       };

        newCell.addEventListener('click', function(){
            if(Cell_LongSelected!=null) { // Système de déplacement des cells
                for(let c=0; c<appContent.children.length; c++){
                    if(appContent.children[c].getAttribute("data-id")==Cell_LongSelected){

                        let newCell_cover=newCell.querySelectorAll("*");
                        let selectCell_cover=appContent.children[c].querySelectorAll("*");

                        while(appContent.children[c].lastElementChild){
                            appContent.children[c].removeChild(appContent.children[c].lastElementChild)
                        }
                        while(newCell.lastElementChild){
                            newCell.removeChild(newCell.lastElementChild)
                        }


                        if(selectCell_cover.length>0){
                            newCell.innerHTML="";
                            for(let i=0; i<selectCell_cover.length; i++){
                                newCell.appendChild(selectCell_cover[i]);
                            }
                        }
                        else{
                            newCell.innerHTML="+";
                        }

                        if(newCell_cover.length>0){
                            appContent.children[c].innerHTML="";
                            for(let i=0; i<newCell_cover.length; i++){
                                appContent.children[c].appendChild(newCell_cover[i]);
                            }
                        }
                        else{
                            appContent.children[c].innerHTML="+";
                        }
                    }
                }
                Cell_LongSelected=null;
                for(let c=0; c<appContent.children.length; c++){
                    appContent.children[c].style.border="none";
                }
            }
            else{
                cellsOpenSelectionner(newCell);
            }
        });

        newCell.addEventListener('touchstart', function() {
            Cell_HoldingTimeout = setTimeout(function() {
                for(let c=0; c<appContent.children.length; c++){
                    appContent.children[c].style.border="none";
                }
                newCell.style.border="2px white solid"
                Cell_LongTouch = true;
                Cell_LongSelected = newCell.getAttribute("data-id");
            }, 500);
        });

        newCell.addEventListener('touchend', function() {
            Cell_LongTouch = false;
            clearTimeout(Cell_HoldingTimeout);
        });
        newCell.addEventListener('touchmove', function() {
            Cell_LongTouch = false;
            clearTimeout(Cell_HoldingTimeout);
        });

        newCell.addEventListener('mousedown', function() {
            Cell_HoldingTimeout = setTimeout(function() {
                for(let c=0; c<appContent.children.length; c++){
                    appContent.children[c].style.border="none";
                }
                newCell.style.border="2px white solid"
                Cell_LongTouch = true;
                Cell_LongSelected = newCell.getAttribute("data-id");
            }, 500);
        });

        newCell.addEventListener('mouseup', function() {
            Cell_LongTouch = false;
            clearTimeout(Cell_HoldingTimeout);
        });

        appContent.replaceChild(newCell, appContent.children[i]);
    }

};

makeRows((GridColumns*GridRows));

var INPUT_ColumnsRange=document.getElementById("app-settings-columnsRange");
var lastColumnValue=INPUT_ColumnsRange.value;
INPUT_ColumnsRange.addEventListener("input", function(e) {
    document.getElementById("app-settings-columnsRange_label").innerHTML='Columns: '+INPUT_ColumnsRange.value;

    if(DesktopMode){
        GridRows=parseInt(INPUT_ColumnsRange.value)+1;
        GridColumns=parseInt(INPUT_ColumnsRange.value*2);
    }
    else{
        GridColumns=INPUT_ColumnsRange.value;
        GridRows=(INPUT_ColumnsRange.value*2)+1;
    }

    let cellsToEdit=(GridColumns*GridRows)-appContent.childElementCount;
    makeRows(cellsToEdit);

    if(lastColumnValue<INPUT_ColumnsRange.value){
        if (lastPlaylistUsed=="spotify") SpotifyPlaylist();
        else if(lastPlaylistUsed="deezer") DeezerPlaylist();
    }
    lastColumnValue=INPUT_ColumnsRange.value;
});

//Gap
var INPUT_gapSize=document.getElementById("app-settings-gapValue");
INPUT_gapSize.addEventListener("input", function(e) {
    document.getElementById("app-settings-gapValue_label").innerHTML='Gap size: '+INPUT_gapSize.value+"px";

    appContent.style.gap=INPUT_gapSize.value+"px";

    document.getElementById("app-menu-example").style.gap=INPUT_gapSize.value+"px";
});

//Background Color
var INPUT_backgroundColor=document.getElementById("app-settings-backColor");
INPUT_backgroundColor.addEventListener("input", function(e) {
    let color=INPUT_backgroundColor.value;
    appContent.style.backgroundColor=color;
    document.getElementById("app-menu-example").style.backgroundColor=color;
    document.body.style.background=color;
});

//Clear button
var BTN_clearGrid=document.getElementById("app-settings-clear");
BTN_clearGrid.addEventListener("click", function(e) {
    for(let c=appContent.children.length; c>0; c--) {
        appContent.removeChild(appContent.lastElementChild);
    } 
    makeRows((GridColumns*GridRows));
});

//Export quality
var INPUT_exportQuality=document.getElementById("app-settings-qualityValue");
var ExportQualitySteps=["Low", "Medium", "Good", "Very good"]
INPUT_exportQuality.addEventListener("input", function(e) {
    document.getElementById("app-settings-qualityValue_label").innerHTML='Export quality: '+ExportQualitySteps[INPUT_exportQuality.value-1];
});


//= Menu Buttons =
document.getElementById("app-menu-home").addEventListener('click', (event) => {
    AppSwitch();
});
//======


//=== Cover selection ===

//= Ouverture/Fermeture du popup de sélection =
appCoverSelectionner.addEventListener("click", (e) => {
    if(e.target !== appCoverSelectionner) return;

    appCoverSelectionner.style.display="none";
    appCoverSelectionner.style.visibility="hidden";

    list_appCoverSelectionner.style.display="none";
    list_appCoverSelectionner.style.visibility="hidden";
});
function cellsOpenSelectionner(cell){
    appCoverSelectionner.setAttribute("data-selectID", cell.getAttribute("data-id"));
    if(cell.querySelector('.grid-cell-cover') !== null){
        appCoverSelectionner.style.display="flex";
        appCoverSelectionner.style.visibility="visible";
        visualize_appCoverSelectionner.src=cell.querySelector('.grid-cell-cover').src;
        BTN_chosedCover_REMOVE.disabled=false;
    }
    else{
        appCoverSelectionner.style.display="flex";
        appCoverSelectionner.style.visibility="visible";
        BTN_chosedCover_REMOVE.disabled=true;
    }
}

//Fermeture de la liste déroulante
appCoverSelectionner.querySelector(".group").addEventListener("click", (e) => {
    if(e.target !== appCoverSelectionner.querySelector(".group")) return;

    list_appCoverSelectionner.style.display="none";
    list_appCoverSelectionner.style.visibility="hidden";
});

//= Album choice =
async function getJsonSearch(url) {
    let response = await fetch(url).catch(function(error) {console.log(error)});
    let data = await response.json()
    return data;
}

INPUT_appCoverSelectionner_SEARCH.addEventListener("keydown", async function(e){
    if(e.keyCode != 13) return;

    if(INPUT_appCoverSelectionner_SEARCH.value.length>0){
        list_appCoverSelectionner.style.display="flex";
        list_appCoverSelectionner.style.visibility="visible";
        list_appCoverSelectionner.style.top=INPUT_appCoverSelectionner_SEARCH.getBoundingClientRect().bottom+15+"px";
        
        let searchResult=await getJsonSearch("https://ws.audioscrobbler.com/2.0/?method=album.search&album="+INPUT_appCoverSelectionner_SEARCH.value+"&api_key=f8a956b6b162beac840f5c7c52d575c5&format=json");
        let searchResultMatches=searchResult.results.albummatches.album;

        for (let c=list_appCoverSelectionner.children.length; c>0; c--) {
            list_appCoverSelectionner.removeChild(list_appCoverSelectionner.lastElementChild);
        } 
        for(let i=0; i<49; i++) {
            //Container data creation

            let container = document.createElement("div");
            //Cover's Image
            let ImgContainer = document.createElement("div");
            ImgContainer.className="img-container";
            let ImgCover = document.createElement("img");
            
            if(searchResultMatches[i]==undefined || searchResultMatches[i].image[CoversQuality]["#text"]=="") continue;

            ImgCover.src=searchResultMatches[i].image[CoversQuality]["#text"];
            ImgCover.className="select_list-cover";
            ImgContainer.appendChild(ImgCover);
            container.appendChild(ImgContainer);

            //Cover's Infos
            let InfosContainer = document.createElement("div");
            InfosContainer.className="select_list-container-infos";

            let CoverSinger = document.createElement("p");
            CoverSinger.className="select_list-singer";
            CoverSinger.innerHTML=searchResultMatches[i].artist;
            InfosContainer.appendChild(CoverSinger);

            let CoverAlbum = document.createElement("p");
            CoverAlbum.className="select_list-album";
            CoverAlbum.innerHTML=searchResultMatches[i].name;
            InfosContainer.appendChild(CoverAlbum);

            container.appendChild(InfosContainer);

            list_appCoverSelectionner.appendChild(container).className="select_list-container";
        };

        //=== Apply containers cover events ===
        let CoverContainers=document.getElementsByClassName("select_list-container");
        for(let i = 0; i < CoverContainers.length; i++) {
            let newCoverContainer=CoverContainers[i].cloneNode(true);
            newCoverContainer.addEventListener('click', function(){
                let ChildrenImgSrc=newCoverContainer.getElementsByClassName("select_list-cover")[0];
                visualize_appCoverSelectionner.src=ChildrenImgSrc.src;

                list_appCoverSelectionner.style.display="none";
                list_appCoverSelectionner.style.visibility="hidden";
            });
            CoverContainers[i].replaceWith(newCoverContainer);
        }
    }
    else{
        list_appCoverSelectionner.style.visibility="hidden";
        list_appCoverSelectionner.style.display="none";
    }
});


//= Select chosed album =
var BTN_listCovers_CHOSE=document.getElementById("app-selectionner-chose");
var DefaultCoverIMG=new Image()
DefaultCoverIMG.src="img/default_cover.png"

BTN_listCovers_CHOSE.addEventListener("click", function(e){
    let IMG_ChosedCover=visualize_appCoverSelectionner.src;

    if(DefaultCoverIMG.src!=IMG_ChosedCover){
        let CellID=appCoverSelectionner.getAttribute("data-selectID");
    
        for (let i = 0; i<appContent.children.length; i++) {
            if(appContent.children[i].getAttribute("data-id")==CellID){
                var cover = document.createElement("img");
                var cover=new Image();
                cover.crossOrigin="anonymous";
                cover.src=IMG_ChosedCover;
                appContent.children[i].innerHTML="";
                appContent.children[i].appendChild(cover).className="grid-cell-cover";
            }
        }
    }

    appCoverSelectionner.style.visibility="hidden";
    appCoverSelectionner.style.display="none";
});
//= Remove selected album =
var BTN_chosedCover_REMOVE=document.getElementById("app-selectionner-delete");
BTN_chosedCover_REMOVE.addEventListener("click", function(e){
    let CellID=appCoverSelectionner.getAttribute("data-selectID");
    
    for (let i = 0; i<appContent.children.length; i++) {
        if(appContent.children[i].getAttribute("data-id")==CellID){
            appContent.children[i].removeChild(appContent.children[i].lastChild);
            appContent.children[i].innerHTML="+";
        }  
    }
    appCoverSelectionner.style.visibility="hidden";
    appCoverSelectionner.style.display="none";
});
//======



//===== Exportation =====
var loader = document.getElementById("loader");
var progressBar = document.getElementById("loader-progressBar");

var download = function(canvas){
    let link = document.createElement('a');
    link.download = 'gridcover.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }

var canvas=document.getElementById("canvas")
var ctx=canvas.getContext("2d");

var BTN_export=document.getElementById("app-menu-export");
BTN_export.addEventListener("click", function(e){
    loader.style.display="flex";
    loader.style.visibility="visible";

    BTN_export.disabled=true;

    let ExportQuality=INPUT_exportQuality.value;
    let GapSize=INPUT_gapSize.value*ExportQuality;
    
    let OneCoverSize=(appContent.firstElementChild.querySelector("img").height)*ExportQuality;
    let maxHeight=((OneCoverSize+GapSize)*GridRows)-GapSize;

    canvas.width=appContent.offsetWidth*ExportQuality;
    canvas.height=maxHeight;

    ctx.fillStyle = appContent.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let posX=0;
    let posY=0;

    let lastHeightSize=0;
    let lastWidthtSize=0;
    let HeighToIncrement=0;
    let WidthToIncrement=0;

    let progressBarIncrementation=100/appContent.children.length;

    for(let i=0; i<appContent.children.length; i++){
        let coverImg=appContent.children[i].querySelector("img");

        if(coverImg==undefined) {
            WidthToIncrement=lastWidthtSize;
            HeighToIncrement=lastHeightSize;
        }
        else {
            WidthToIncrement=coverImg.width*ExportQuality+GapSize;
            HeighToIncrement=coverImg.height*ExportQuality+GapSize;

            lastWidthtSize=coverImg.width*ExportQuality;
            lastHeightSize=coverImg.height*ExportQuality;
        }

        if(DesktopMode){
            if(GapSize>0){
                if(posX>canvas.width){
                    posX=0;
                    posY+=HeighToIncrement;
                }
            }
            else{
                if(posX+WidthToIncrement>canvas.width){
                    posX=0;
                    posY+=HeighToIncrement;
                }
            }
        }
        else{
            if(posX>=canvas.width){
                posX=0;
                posY+=HeighToIncrement;
            }     
        }

        if(coverImg==null){
            posX+=WidthToIncrement;
        }
        else{
            ctx.drawImage(coverImg, posX, posY, coverImg.width*ExportQuality, coverImg.height*ExportQuality);
            posX+=WidthToIncrement;
        }
        progressBar.value+=progressBarIncrementation;
    }

    progressBar=100;
    download(canvas);

    function ProgressBarEffect() {
        loader.style.display="none";
        loader.style.visibility="hidden";
        progressBar.value=0;
    }
    setTimeout(ProgressBarEffect, 1000);

    function CooldownExport() {
        BTN_export.disabled=false;
    }
    setTimeout(CooldownExport, 4000);
});
//==========
