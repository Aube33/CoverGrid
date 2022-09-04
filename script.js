
//===== Globals variables =====

//=== Accueil ===
var homeContent=document.getElementById("home"); //Main

var BTN_launchApp=document.getElementById("btn-launchApp");
var AppFlipFlop=true;
//======

//=== App ===
var appGlobal=document.getElementById("app"); //Main

var appMenu=document.getElementById("app-menu");
var BTN_appMenu_OPEN=document.getElementById("btn-app-menu");
var BTN_appMenu_CLOSE=document.getElementById("app-menu-close");

var CHECK_appMenu_randomize=document.getElementById("app-playlist-random");

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
//==========





//===== App =====

//=== Menu ===
//= Menu Opening/Closure =
BTN_appMenu_OPEN.addEventListener('click', (event) => {
    appMenu.style.visibility="visible";
    appMenu.style.right="0";
});
BTN_appMenu_CLOSE.addEventListener('click', (event) => {
    appMenu.style.right="100%";
    appMenu.style.visibility="hidden";
});


//= Spotify integration =
let trackLimit=100

const _getToken = async () => {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa("84d18b8414d341ac955361219c178813" + ':' + "025864421624491990d474426b484749")
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

async function getJsonPlaylist(playlistID, offset) {
    let token=await _getToken()
    let response = await fetch('https://api.spotify.com/v1/playlists/'+playlistID+ "/tracks?limit=100&offset="+offset, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer '+token}
    });
    let data = await response.json()
    return data;
}

var TEXT_appMenu_SPOTIFY = document.getElementById("app-spotify-playlist");
TEXT_appMenu_SPOTIFY.addEventListener("keydown", async function(e){
    if(e.keyCode != 13) return;

    let LoopsNeeded=1;

    let playlistID=TEXT_appMenu_SPOTIFY.value.split("/");
    playlistID=playlistID[playlistID.length-1];

    let playlistData=await getJsonPlaylist(playlistID, 0);
    if(playlistData.total>trackLimit){
        LoopsNeeded=Math.floor(playlistData.total/trackLimit);
        if(playlistData.total%trackLimit!=0) LoopsNeeded+=1;
    }

    let playlistUrls=[];
    for(let l=0; l<LoopsNeeded; l++){
        let playlistData=await getJsonPlaylist(playlistID, l);
        let playlistItems=playlistData.items;

        for(let i=0; i<playlistItems.length; i++){
            if(playlistUrls.includes(playlistItems[i].track.album.images[0].url)) continue;
            playlistUrls.push(playlistItems[i].track.album.images[0].url)
        }
    }

    if(CHECK_appMenu_randomize.checked){
        for (let i = playlistUrls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = playlistUrls[i];
            playlistUrls[i] = playlistUrls[j];
            playlistUrls[j] = temp;
        }
    }    

    for(let c=0; c<playlistUrls.length && c<appContent.children.length; c++){
        var cover = document.createElement("img");
        var cover=new Image();
        cover.crossOrigin="anonymous";
        cover.src=playlistUrls[c];
        appContent.children[c].innerHTML="";
        appContent.children[c].appendChild(cover).className="grid-cell-cover";
    }
});


//= Settings =

//Columns Value
var GridColumns=4
var GridRows=(GridColumns*2)+1

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
            }, 400);
        });

        newCell.addEventListener('touchend', function() {
            Cell_LongTouch = false;
            clearTimeout(Cell_HoldingTimeout);
        });

        appContent.replaceChild(newCell, appContent.children[i]);
    }

};

makeRows((GridColumns*GridRows));

var INPUT_ColumnsRange=document.getElementById("app-settings-columnsRange");
INPUT_ColumnsRange.addEventListener("input", function(e) {
    document.getElementById("app-settings-columnsRange_label").innerHTML='Columns: '+INPUT_ColumnsRange.value;

    GridColumns=INPUT_ColumnsRange.value;
    GridRows=(INPUT_ColumnsRange.value*2);
    let cellsToEdit=(GridColumns*GridRows)-appContent.childElementCount;
    makeRows(cellsToEdit);

})

//Gap
var INPUT_gapSize=document.getElementById("app-settings-gapValue");
INPUT_gapSize.addEventListener("input", function(e) {
    document.getElementById("app-settings-gapValue_label").innerHTML='Gap size: '+INPUT_gapSize.value+"px";

    appContent.style.gap=INPUT_gapSize.value+"px";

    document.getElementById("app-menu-example").style.gap=INPUT_gapSize.value+"px";
})

//Background Color
var INPUT_backgroundColor=document.getElementById("app-settings-backColor");
INPUT_backgroundColor.addEventListener("input", function(e) {
    appContent.style.backgroundColor=INPUT_backgroundColor.value;
    document.getElementById("app-menu-example").style.backgroundColor=INPUT_backgroundColor.value;
})


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
    canvas.width=screen.width*4;
    canvas.height=screen.height*4;

    ctx.fillStyle = appContent.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let posX=0;
    let posY=0;
    let maxWidth=screen.width*4;
    let maxHeight=screen.height*4;
    let lastSize=0;
    let HeighToIncrement=0;

    for(let i=0; i<appContent.children.length; i++){
        let coverImg=appContent.children[i].querySelector("img");

        if(coverImg==undefined) HeighToIncrement=lastSize;
        else {
            HeighToIncrement=coverImg.height*4;
            lastSize=coverImg.height*4;
        }

        if(posX>=maxWidth){
            posX=0;
            //posY+=screen.height*4/GridRows;
            posY+=HeighToIncrement;
        }
        if(posY>maxHeight){
            posY=0;
        }

        if(coverImg==null){
            posX+=screen.width*4/GridColumns;
        }
        else{
            ctx.drawImage(coverImg, posX, posY, coverImg.width*4, coverImg.height*4);
            posX+=screen.width*4/GridColumns;
        }
    }

    download(canvas);
});
//==========