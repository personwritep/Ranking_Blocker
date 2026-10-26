// ==UserScript==
// @name        Ranking Blocker
// @namespace        http://tampermonkey.net/
// @version        2.1
// @description        不要なランキングノミネートの非表示
// @author        Ameba Blog User
// @match        https://blogger.ameba.jp/genres/*
// @match        https://blogger.ameba.jp/hashtags/*
// @match        https://blogger.ameba.jp/ranking/*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Ranking_Blocker/raw/main/Ranking_Blocker.user.js
// @downloadURL        https://github.com/personwritep/Ranking_Blocker/raw/main/Ranking_Blocker.user.js
// ==/UserScript==


let block_id=[];
let read_json=localStorage.getItem('RankingBlock_ID'); // ローカルストレージ保存名
block_id=JSON.parse(read_json);
if(block_id==null){
    block_id=['tmp1','%Ameba-ID'];
    write_local(); }


let block_id_dupe=block_id.concat(); // block_idを複製
if(block_id_dupe.length>2){
    block_id_dupe.splice(0,2); } // 先頭の2要素を削除
else{
    block_id_dupe=["%"]; } // 登録0の場合 検索エラー抑止
let block_filter=block_id_dupe.join('|');
let block_regex=RegExp(block_filter); // RegExpを生成


let edit_mode; // Ranking Blocker の動作モード
edit_mode=localStorage.getItem('RankingBlock_mode'); // ローカルストレージ保存名
if(edit_mode!=0 && edit_mode!=1){
    edit_mode=0;
    localStorage.setItem('RankingBlock_mode', 0); } // edit_mode 初期値「0」


function write_local(){
    let write_json=JSON.stringify(block_id);
    localStorage.setItem('RankingBlock_ID', write_json); } // ストレージ保存名




let retry=0;
let interval=setInterval(wait_target, 100);
function wait_target(){
    retry++;
    if(retry>10){ // リトライ制限 10回 1sec
        clearInterval(interval); }
    let target=document.querySelector('.-ameblo-cmnhf-logo a'); // 監視 target
    if(target){
        clearInterval(interval);
        setter(); }}


function setter(){
    let help_url='https://ameblo.jp/personwritep/entry-12757564496.html';

    let help_SVG=
        '<svg class="help_rb" viewBox="0 0 210 220">'+
        '<path d="M89 22C71 25 54 33 41 46C7 81 11 142 50 171C58 177 '+
        '68 182 78 185C90 188 103 189 115 187C126 185 137 181 146 175'+
        'C155 169 163 162 169 153C190 123 189 80 166 52C147 30 118 18'+
        ' 89 22z" style="fill:#000;"></path>'+
        '<path d="M67 77C73 75 78 72 84 70C94 66 114 67 109 83C106 91'+
        ' 98 95 93 101C86 109 83 116 83 126L111 126C112 114 122 108 1'+
        '29 100C137 90 141 76 135 64C127 45 101 45 84 48C80 49 71 50 '+
        '68 54C67 56 67 59 67 61L67 77M85 143L85 166L110 166L110 143L'+
        '85 143z" style="fill:#fff;"></path>'+
        '</svg>';

    let help_rb=
        '<a href="'+ help_url +'" target="_blank" rel="noopener">'+ help_SVG +'</a>'+
        '<style>'+
        '.help_rb { position: absolute; right: 12px; top: 3px; '+
        'height: 24px; width: 24px; cursor: pointer; } '+
        '.BloggerWebDesktopLegacyChrome-module__OgwvmW__ameba-header { '+
        'visibility: visible; }</style>';

    let ambHeader=document.querySelector('#ambHeader');
    if(ambHeader && !document.querySelector('.help_rb')){
        ambHeader.insertAdjacentHTML('beforeend', help_rb); }


    let rb_style=
        '<style class="RB_style">'+
        '.-ameblo-cmnhf-logo { width: 66px; padding-left: 7px; cursor: pointer; '+
        'outline: #028d9f solid 1px; outline-offset: -2px; border-radius: 3px; }'+
        '.-ameblo-cmnhf-logo a { pointer-events: none; }'+
        '.RB_sw { position: absolute; top: 4px; left: -40px; font: bold 10px Meiryo; '+
        'padding: 5px 2px 4px; border: 1px solid #aaa; background: #fff; '+
        'cursor: pointer; display: none; }'+
        '.RB_sw::after { content: "　"; font: 18px/24px meiryo; position: absolute; '+
        'top: 0; right: -12px; }'+
        '.RB_sw.I { top: 0 !important; left: 4px !important; } '+
        '.RB_item.I { position: relative; }'+
        '.RB_sw.B:hover { color: red; }'+
        '.RB_sw.U:hover { color: #26c6da; }'+
        '.RB_item:hover .RB_sw, .RB_itemI:hover .RB_sw { display: block; }'+
        '</style>';

    if(!document.querySelector('.RB_style')){
        document.body.insertAdjacentHTML('beforeend', rb_style); }


    let logo_sw=document.querySelector('.-ameblo-cmnhf-logo');
    if(edit_mode==0){
        logo_sw.style.outlineColor='#028d9f';
        logo_sw.style.background='#fff'; }
    else{
        logo_sw.style.outlineColor='#fff';
        logo_sw.style.background='red'; }

    logo_sw.addEventListener('click', function(event){
        event.preventDefault();
        if(event.ctrlKey==true){
            menu(); }
        else{
            emode_set(); }}, false);


    hiliter();

} // setter()




function menu(){
    let inner=
        '<div id="file_menu">'+
        '<input id="button0" type="submit" value="✖">'+
        '<input id="button1" type="submit" value="ブロックデータを保存">'+
        '<input id="button_add" type="checkbox">'+
        '<span id="button_add_label">差分追加</span>'+
        '<input id="button2" type="submit" value="ファイルを読込む">'+
        '<input id="button3" type="file">'+
        '<span id="marks"></span>'+
        '<input id="button4" type="submit" value="初期化">'+
        '<input id="id_box" type="text">'+
        '<input id="button5" type="submit" value="Set">'+

        '<style>'+
        '#file_menu { position: fixed; top: 0; left: 0; width: 100%; display: flex; '+
        'align-items: center; justify-content: flex-start; height: 46px; padding: 0 25px; '+
        'box-sizing: border-box; white-space: nowrap; background: #82bddc; } '+
        '#file_menu input { '+
        'font: normal 15px/22px Meiryo; height: 30px; padding: 3px 8px 0; cursor: pointer; '+
        'border: 1px solid #aaa; border-radius: 4px; background: #fff; } '+
        '#file_menu input[type="checkbox"] { appearance: auto; } '+
        '#file_menu input[type="text"] { height: 30px !important; } '+
        '#file_menu #button0 { width: 28px; padding: 3px 6px 0; } '+
        '#button_add { margin: 0 5px 0 40px; min-width: 16px; } '+
        '#button_add_label {  font: normal 16px/22px Meiryo; padding: 3px 0 0; } '+
        '#file_menu #button1 { margin-left: 40px; } '+
        '#file_menu #button2 { margin-left: 10px; } '+
        '#file_menu #button3 { display: none; } '+
        '#marks { font: normal 16px/22px Meiryo; margin-left: 15px; padding: 3px 0 0; } '+
        '#file_menu #button4 { margin-left: 15px; } '+
        '#file_menu #id_box { font: normal 16px/21px Meiryo; height: 22px; width: 140px; '+
        'padding: 3px 6px 1px; margin-left: 40px; }'+
        '</style></div>';

    if(!document.querySelector('#file_menu')){
        document.body.insertAdjacentHTML('beforeend', inner); }



    let file_menu=document.querySelector('#file_menu');
    if(file_menu){
        let button0=document.querySelector('#button0');
        if(button0){
            button0.onclick=function(){
                file_menu.remove(); }}


        let button1=document.querySelector('#button1');
        if(button1){
            button1.onclick=function(){
                let write_json=JSON.stringify(block_id);
                let blob=new Blob([write_json], {type: 'application/json'});
                let a=document.createElement("a");
                a.href=URL.createObjectURL(blob);
                document.body.appendChild(a);
                a.download='ranking_bl.json';
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href); }}


        let button_add=document.querySelector('#button_add');
        button_add.checked=true;


        let button2=document.querySelector('#button2');
        if(button2){
            button2.onclick=function(){
                button3.click(); }}

        let button3=document.querySelector('#button3');
        if(button3){
            button3.addEventListener("change" , function(){
                if(!(button3.value)) return; // ファイルが選択されない場合
                let file_list=button3.files;
                if(!file_list) return; // ファイルリストが選択されない場合
                let file=file_list[0];
                if(!file) return; // ファイルが無い場合

                let file_reader=new FileReader();
                file_reader.readAsText(file);
                file_reader.onload=function(){
                    if(file_reader.result.slice(0, 10)=='["tmp1","%'){ // ranking_bl.jsonの確認
                        let data_in=JSON.parse(file_reader.result);

                        if(button_add.checked==true){ // 差分追加処理
                            for(let k=2; k<data_in.length; k++){
                                if(block_regex.test(data_in[k])==false){ // ID未出なら追加
                                    block_id.push(data_in[k]); }}}
                        else{
                            block_id=data_in; } // 読込み上書き処理

                        write_local();

                        let marks=document.querySelector('#marks'); // ファイル読込み後の件数を表示
                        if(marks){
                            marks.innerHTML='Block登録数 [<b>'+ (block_id.length-2) +'</b>]'; }
                        alert(' 🟢 読込み後のブロックデータ　'+ (block_id.length-2) +' 件です');

                        location.reload(); }};
            }); }


        let marks=document.querySelector('#marks');
        if(marks){
            marks.innerHTML='Block登録数 [<b>'+ (block_id.length-2) +'</b>]'; }


        let button4=document.querySelector('#button4');
        if(button4){
            button4.onclick=function(){
                let ok=confirm(
                    " ⛔　全てのブロック登録データを削除します\n"+
                    "　 　 先に 「ブロックデータの保存」 をしておくことをお勧めします");
                if(ok){
                    block_id.splice(2);
                    write_local();
                    location.reload(); }}}


        let id_box=document.querySelector('#id_box');
        let button5=document.querySelector('#button5');
        if(id_box && button5){
            let ameba_id=block_id[1];
            ameba_id=ameba_id.replace('%', '');
            id_box.value=ameba_id;

            button5.onclick=function(){
                block_id[1]='%'+ id_box.value;
                write_local();
                id_box.style.background='#bdfff9';
                setTimeout(()=>{
                    id_box.style.background='';
                    hiliter();
                }, 1000); }}

    } // if(file_menu)

} // menu()




function emode_set(){
    let logo_sw=document.querySelector('.-ameblo-cmnhf-logo');
    if(edit_mode==0){
        edit_mode=1;
        localStorage.setItem('RankingBlock_mode', 1);
        logo_sw.style.outlineColor='#fff';
        logo_sw.style.background='red';
        blocker(); }
    else if(edit_mode==1){
        edit_mode=0;
        localStorage.setItem('RankingBlock_mode', 0);
        logo_sw.style.outlineColor='#028d9f';
        logo_sw.style.background='#fff';
        blocker(); }}




let target0=document.querySelector('head'); // 監視 target
let monitor0=new MutationObserver(neo_pager);
monitor0.observe(target0, {childList: true, subtree: true}); // リストページ更新の監視開始

neo_pager();

function neo_pager(){
    if(location.pathname.includes('blogs/ranking') || // 総合ブログ
       location.pathname.includes('entries/ranking') || // 記事
       location.pathname.includes('ranking/monthly') || // 全体（月間）
       location.pathname.includes('ranking/daily')){ // 全体（デイリー）

        pager();

    } // 総合ブログ・記事・全体（月間）・全体（デイリー）の場合
    else{
        let input_page=document.querySelector('#input_page');
        if(input_page){
            input_page.remove(); } } // ハッシュタグ・新着の場合は使えない


    function pager(){
        let input_box=
            '<input id="input_page" type="number" autofocus="" min="0" step="20">'+
            '<style>'+
            '#ambHeader { visibility: visible !important; } '+
            'nav { position: relative; } '+
            '#input_page { position: absolute; top: -2px; right: 0; '+
            'font: bold 16px Meiryo; padding: 3px 3px 0 20px; width: 60px; height: 26px; '+
            'border-left: 20px solid var(--bgc1); border-right: 30px solid var(--bgc1); }'+
            '#input_page::-webkit-inner-spin-button { height: 20px; margin-top: 1px; }'+
            '</style>';

        let nav=document.querySelector('header>nav');
        if(nav && !document.querySelector('#input_page')){
            nav.insertAdjacentHTML('beforeend', input_box); }


        let input_page=document.querySelector('#input_page');

        let wurl=window.location.search; // クエリー文字列から現在のページを取得
        let q=0;
        if(wurl){
            let query=wurl.split('&');
            for(let k=0; k<query.length; k++){
                if(query[k].includes('rank=')){ // 総合ブログ・全体（月間）・全体（デイリー）
                    q=query[k].replace(/[^0-9]/g, ''); }
                if(query[k].includes('offset=')){ // 記事
                    q=query[k].replace(/[^0-9]/g, ''); }}}

        input_page.value=q;

        document.onkeydown=function(event){
            if(event.keyCode==38){ // 「⇧」キーを取得
                event.preventDefault();
                input_page.stepUp(1); }
            if(event.keyCode==40){ // 「⇩」キーを取得
                event.preventDefault();
                input_page.stepDown(1); }}


        if(location.pathname.includes('blogs/ranking') || // 総合ブログ
           location.pathname.includes('ranking/monthly') || // 全体（月間）
           location.pathname.includes('ranking/daily')){ // 全体（デイリー）
            document.addEventListener('keydown', function(event){
                if(event.keyCode==13){
                    event.preventDefault();
                    let jump_url=window.location.href.split('?')[0]+
                        '?rank='+input_page.value+'&amebaId='+input_page.value;
                    window.location.href=jump_url; }}); }


        if(location.pathname.includes('entries/ranking')){ // 記事
            document.addEventListener('keydown', function(event){
                if(event.keyCode==13){
                    event.preventDefault();
                    let jump_url=window.location.href.split('?')[0]+
                        '?offset='+input_page.value+'&amebaId=0&entryId=0';
                    window.location.href=jump_url; }}); }

    } // pager();

} // neo_pager()




let target1=document.querySelector('head'); // 監視 target
let monitor1=new MutationObserver(blocker);
monitor1.observe(target1, {childList: true, subtree: true}); // リストページ更新監視開始

blocker();

function blocker(){
    let k;
    let user_href=[];
    let user_a=[];
    let user_aH=[];
    let user_id=[];


    if(location.pathname.includes('genres/') || // 総合ブログ・記事・新着記事
       location.pathname.includes('hashtags/')){ // ハッシュタグ

        let g_nav=document.querySelectorAll(
            '.BloggerWebDesktopGenreHeader-module__bpphDa__tabs li');
        if(g_nav.length>0){
            if(g_nav[1].dataset.active=="true"){
                let rank_itemA=document.querySelectorAll(
                    '.BloggerWebDesktopBlogRankingTextItem-module__Ca_Mha__item');
                for(k=0; k<rank_itemA.length; k++){
                    user_a[k]=rank_itemA[k].querySelector('[class$="Ca_Mha__user-link"]');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item(rank_itemA[k], user_href[k]);
                    check_item(rank_itemA[k], user_href[k]); } // 総合ブログ サムネイル1個

                let rank_itemAi=document.querySelectorAll(
                    '.BloggerWebDesktopGenreBlogRanking-module__68wECW__item');
                for(k=0; k<rank_itemAi.length; k++){
                    user_a[k]=rank_itemAi[k].querySelector('[class$="68wECW__profile-link"]');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item(rank_itemAi[k], user_href[k]);
                    check_item(rank_itemAi[k], user_href[k]); }} // 総合ブログ サムネイル2個


            if(g_nav[2].dataset.active=="true"){
                let rank_itemT=document.querySelectorAll(
                    '.BloggerWebDesktopGenreEntryRanking-module__rKPCjq__item');
                for(k=0; k<rank_itemT.length; k++){
                    user_a[k]=rank_itemT[k].querySelector('[class$="rKPCjq__profile"]');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item(rank_itemT[k], user_href[k]);
                    check_item(rank_itemT[k], user_href[k]); } // 記事 通常タイプ

                let rank_itemTi=document.querySelectorAll(
                    '.BloggerWebDesktopGenreEntryRanking-module__rKPCjq__image-item');
                for(k=0; k<rank_itemTi.length; k++){
                    user_a[k]=rank_itemTi[k].querySelector('[class$="rKPCjq__image-blog-name"] a');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item_i(rank_itemTi[k], user_href[k]);
                    check_item_i(rank_itemTi[k], user_href[k]); }} // 記事 画像タイルタイプ


            if(g_nav[3].dataset.active=="true"){
                let rank_itemH=document.querySelectorAll(
                    '.BloggerWebDesktopHashtagEntryRanking-module__OK2WHq__item');
                for(k=0; k<rank_itemH.length; k++){
                    user_a[k]=rank_itemH[k].querySelector('[class$="OK2WHq__weak-text"]');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item(rank_itemH[k], user_href[k]);
                    check_item(rank_itemH[k], user_href[k]); }} // ハッシュタグ


            if(g_nav[4].dataset.active=="true"){
                let rank_itemRi=document.querySelectorAll(
                    '.BloggerWebDesktopGenreNewsList-module__NkmBcG__image-item');
                for(k=0; k<rank_itemRi.length; k++){
                    user_a[k]=rank_itemRi[k].querySelector('[class$="NkmBcG__image-title"] a');
                    user_href[k]=user_a[k].getAttribute('href').split('/entry-')[0];
                    block_item(rank_itemRi[k], user_href[k]);
                    check_item(rank_itemRi[k], user_href[k]); } // 新着記事 ユーザーアイコン無し

                let rank_itemR=document.querySelectorAll(
                    '.BloggerWebDesktopNewsTextItem-module__gBBEqa__item');
                for(k=0; k<rank_itemR.length; k++){
                    user_a[k]=rank_itemR[k].querySelector('[class$="gBBEqa__user-link"]');
                    user_href[k]=user_a[k].getAttribute('href');
                    block_item(rank_itemR[k], user_href[k]);
                    check_item(rank_itemR[k], user_href[k]); }} // 新着記事 ユーザーアイコン有り

        }} // 総合ブログ・記事・ハッシュタグ・新着記事


    if(location.pathname.includes('ranking/monthly') || // 全体（月間）
       location.pathname.includes('ranking/daily')){ // 全体（デイリー）
        let rank_itemA=document.querySelectorAll(
            '.BloggerWebDesktopBlogRankingTextItem-module__Ca_Mha__item');
        for(k=0; k<rank_itemA.length; k++){
            user_a[k]=rank_itemA[k].querySelector('[class$="Ca_Mha__user-link"]');
            user_href[k]=user_a[k].getAttribute('href');
            block_item(rank_itemA[k], user_href[k]);
            check_item(rank_itemA[k], user_href[k]); }

    } // 全体（月間・デイリー）



    function block_item(item, user_href){
        if(block_regex.test(user_href)==true){
            if(edit_mode==0){
                item.style.visibility='hidden'; }
            else if(edit_mode==1){
                item.style.visibility='visible';
                item.style.background='#a9c1cf'; }}}


    function block_item_i(item, user_href){
        if(block_regex.test(user_href)==true){
            if(edit_mode==0){
                item.style.visibility='hidden'; }
            else if(edit_mode==1){
                item.style.visibility='visible';
                item.style.background='#a9c1cf'; }}}


    function check_item(item, user_href){
        item.classList.add('RB_item');
        let sw;
        if(block_regex.test(user_href)==false){
            sw='<div class="RB_sw B">Block</div>'; }
        else{
            sw='<div class="RB_sw U">Unset</div>'; }
        if(!item.querySelector('.RB_sw')){
            item.insertAdjacentHTML('beforeend', sw); }

        let RB_sw=item.querySelector('.RB_sw');
        RB_sw.onclick=function(event){
            event.preventDefault();
            local_backup(user_href); }}


    function check_item_i(item, user_href){
        item.classList.add('RB_item', 'I');
        let sw;
        if(block_regex.test(user_href)==false){
            sw='<div class="RB_sw I B">Block</div>'; }
        else{
            sw='<div class="RB_sw I U">Unset</div>'; }
        if(!item.querySelector('.RB_sw')){
            item.insertAdjacentHTML('beforeend', sw); }

        let RB_sw=item.querySelector('.RB_sw');
        RB_sw.onclick=function(event){
            event.preventDefault();
            local_backup(user_href); }}


    function local_backup(user_href){
        if(block_regex.test(user_href)!=true){
            let ok=confirm(" ⛔　 ブロックリストに登録しますか？");
            if(ok){
                let user_id=user_href.replace('https://ameblo.jp/', '');
                user_id=user_id.replace(/\//g, '');
                block_id.push(user_id);
                write_local();
                location.reload(); }}
        if(block_regex.test(user_href)==true){
            let ok=confirm(" 🟢　 ブロックリストから外し表示させますか？");
            if(ok){
                let user_id=user_href.replace('https://ameblo.jp/', '');
                user_id=user_id.replace(/\//g, '');
                block_id=block_id.filter( function(item){
                    return item !==user_id; });
                write_local();
                location.reload(); }}}

} // blocker




function hiliter(){
    let ameba_id=block_id[1]; // block_id=['tmp1', '%Ameba-ID', 'xxxxxx', ]
    ameba_id=ameba_id.replace('%', '');

    let am_style=
        '<style class="AM_style">'+
        'li:not([class$="item-prev"]):not([class$="item-next"]):has([href*="'+ ameba_id +'"]) { '+
        'outline: 2px solid red; outline-offset: -2px; } '+
        'li[class*="rKPCjq__image-item"]:has([href*="'+ ameba_id +'"]) { '+
        'background: red } '+
        '</style>';

    if(document.querySelector('.AM_style')){
        document.querySelector('.AM_style').remove(); }
    document.body.insertAdjacentHTML('beforeend', am_style);

} // hiliter()
