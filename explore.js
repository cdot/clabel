var data = new Uint8Array(9999);

function button1_click(){

    //alert("button clicked");

    var oReq = new XMLHttpRequest();
    oReq.open("GET", document.getElementById("text1").value, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            for (var i = 0; i < byteArray.byteLength; i++) {
                // do something with each byte in the array
            }
            file1 = byteArray;
            file1pos=0;
            processfile();
            //alert(byteArray.length);
        }
    };

    oReq.send(null);

    
}

var myfilereader=new FileReader();
var myarraybuffer;
var myuint8array;
var file1;

function filereaderonload(evt){
    myarraybuffer=evt.target.result;
    var myuint8array = new Uint8Array(myarraybuffer);
    file1 = myuint8array;
    file1pos=0;
    processfile();
}

document.getElementById("fileinput").onchange = function(evt){
    myfilereader.onload=filereaderonload;
    myarraybuffer=myfilereader.readAsArrayBuffer(evt.target.files[0]);};

var mycanvas = document.createElement("canvas");
mycanvas.id = "canvasOne";
mycanvas.width=3000;
mycanvas.height=720;
var mycontext = mycanvas.getContext("2d");
document.body.appendChild(mycanvas);

var file0 = new ArrayBuffer(256);
file1 = new Uint8Array(data);
var file1pos=0;
var inputbyte=0;
function chr(x){return String.fromCharCode(x);}
function asc(x){return x.charCodeAt(0);}

function getchar(){inputbyte=file1[file1pos++];
                   //print("input=("+file1pos+","+inputbyte+") ");
                   //if ((inputbyte=>32)&&(inputbyte<=126)){print(String.fromCharCode(inputbyte)+" ");}

                  }


function getchar_count(x){
    var i;
    for (i=0;i<x;i++){getchar();print("input=("+file1pos+",n"+i+":"+inputbyte+") ");
                     }
}

function print(a){
    if (document.getElementById("see output").checked)
    {//document.getElementById("test").innerHTML+=a+" ";
        var newtextnode=document.createTextNode(a+" ");
        //document.appendChild(newtextnode); doesn't work
        //document.body.appendChild(newtextnode);
        document.getElementById("test").appendChild(newtextnode);
    }
}
function println(a){
    if (document.getElementById("see output").checked)
    {
        //print(a+"<BR>");
        print(a);
        //document.body.appendChild(document.createElement("<br>")); doesn't work
        //document.body.appendChild(document.createElement("br"));
        document.getElementById("test").appendChild(document.createElement("br"));
    }
}

document.write("<div id='test'></div>");
document.getElementById("test").innerHTML="testing_output<br>";

function renderdata(inputbyte,x,y){
    if (y+8>ymax)ymax=y+8;
    var stripimagedata=mycontext.createImageData(1,8);
    var i=0;
    for (i=0;i<8;i++){
        if (((1<<i)&inputbyte)){
            //print("x");
            stripimagedata.data[(7-i)*4]=0;
            stripimagedata.data[(7-i)*4+1]=0;
            stripimagedata.data[(7-i)*4+2]=0;
            stripimagedata.data[(7-i)*4+3]=255;
        }

        else {
            //print("o");
            stripimagedata.data[(7-i)*4]=255;
            stripimagedata.data[(7-i)*4+1]=255;
            stripimagedata.data[(7-i)*4+2]=255;
            stripimagedata.data[(7-i)*4+3]=255;
        }
    }
    mycontext.putImageData(stripimagedata,x,y);
    //println();
}

var xpos = 0,ypos=0;  
var xmin=0,xmax=0;
var ymax;
var expansionbuffer;
var compression =0;
var skipcount = 0;
var skipchar = "";

function processfile_init(){
    if (document.getElementById("clear canvas").checked)
        mycontext.clearRect(0,0,mycanvas.width,mycanvas.height);

    if (document.getElementById("clear output").checked)
        document.getElementById("test").innerHTML="";
    xpos=0,ypos=0;  
    xmin=0,xmax=0;
    ymax=0;
    expansionbuffer = new Uint8Array(256);
    compression =0;
    skipcount = 0;
    skipchar = "";
    for (;;){
        getchar();
        if (inputbyte===27) break;
        if (inputbyte===undefined) break;
        skipchar="";
        if ((inputbyte>=32)&&(inputbyte<=126))skipchar=String.fromCharCode(inputbyte);
        println("SKIPPING UNTIL ESC ("+skipcount+","+inputbyte+","+skipchar+")");
        skipcount++;
    }

}

function processfile_loop(){

    everycounter=0;
    for (;;){
        if (inputbyte===0x1b){
            print("ESC");
            getchar();
            if (chr(inputbyte)==="@"){
                println("ESC @ initialize");
            }
            else if (inputbyte===0x5c){
                println("ESC \\ set relative position");
                getchar();
                byte0 = inputbyte;
                getchar();
                println ("Set X position relative "+(byte0+inputbyte*256));
                //actually supposed to be a 16 bit signed number, so values over 32767 are negative
                xpos += byte0 + inputbyte*256
                if (xpos>xmax){xmax=xpos}
            }
            else if (chr(inputbyte)==="i"){
                print("ESC i");
                getchar();
                if (chr(inputbyte)==="M"){
                    print("ESC i M");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="B"){
                    println("ESC i B Baudrate Change");
                    getchar();
                    for (i=0;i<49;i++){getchar();print(i.toString()+" "+inputbyte.toString());}
                }
                else if (chr(inputbyte)==="D"){
                    println("ESC i D");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="R"){
                    print("ESC i R");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="P"){
                    println("ESC i P continuous page");
                    xmin = xmax;xpos=xmin;ypos=0;
                }
                else if (chr(inputbyte)==="S"){
                    println("ESC i S Status Request");
                }
                else if (chr(inputbyte)==="K"){
                    print("ESC i K set expanded mode");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="a"){
                    print("ESC i a switch between ESC p and ptcbp mode");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="c"){
                    print("ESC i c Print Information Command");
                    getchar_count(5);
                    println("");
                }
                else if (chr(inputbyte)==="d"){
                    print("ESC i d Set Margin Amount");
                    getchar_count(2);
                    println("");
                }
                else if (chr(inputbyte)==="A"){
                    print("ESC i A CODE FOR PT9700  AUTOCUT ENABLE");
                    getchar_count(1);
                    println("");
                }
                else if (chr(inputbyte)==="z"){
                    print("ESC i z CODE FOR QL500");
                    getchar_count(10);
                    println("");
                }
                

                else {
                    println("Unrecognized ESC i code "+inputbyte);
                }
            }
            else if (chr(inputbyte)==="*"){
                println("ESC * graphics command");
                getchar();
                if (inputbyte = 39){print("got mode=39");} else {print("not mode 39");break;}
                getchar();
                bytecount = inputbyte;
                getchar();
                bytecount += 256*inputbyte;
                println ("bytecount = "+bytecount+" expect "+bytecount*3+" bytes");
                for (i=0;i<bytecount;i++){
                    getchar();
                    renderdata(inputbyte,xpos,ypos);
                    getchar();
                    renderdata(inputbyte,xpos,ypos+8);
                    getchar();
                    renderdata(inputbyte,xpos,ypos+16);

                    renderdata(0x55,xpos+1,ypos);
                    renderdata(0x55,xpos+1,ypos+8);
                    renderdata(0x55,xpos+1,ypos+16);
                    renderdata(0x55,xpos,ypos+24);
                    xpos++;
                    if (xpos>xmax){xmax=xpos}
                }
            }
            else {println("unrecognized ESC code "+inputbyte); break;}
        }
        else if (chr(inputbyte)==="G"){
            print("G raster line data");
            getchar();
            byte1=inputbyte;
            getchar();
            byte2=inputbyte;
            numchars = byte1 + byte2*256;
            print("numchars= "+numchars);
            if (compression){
                print("compression=on");
                count=0;
                expansionbufferpos=0;
                while(count < numchars){
                    getchar();
                    count++;
                    if (inputbyte >= 128){ 
                        repeatcount = (256-inputbyte)+1;
                        getchar();
                        count++;
                        for (i=0;i<repeatcount;i++){expansionbuffer[expansionbufferpos++]=inputbyte;}
                    }
                    else {
                        numchars0 = inputbyte + 1;
                        for (i=0;i<numchars0;i++){
                            getchar();
                            count++;
                            expansionbuffer[expansionbufferpos++]=inputbyte;
                        }  //end for
                    } // end else
                } // end while
                for (i=0;i<expansionbufferpos;i++) renderdata(expansionbuffer[i],xpos,i*8);
                for (i=0;i<expansionbufferpos;i++) renderdata(0xaa,xpos+1,i*8);
                println("expansionbufferlength="+expansionbufferpos);
            }  // end compression

            else {  // no compression
                println("compression=off");
                for (i=0;i<numchars;i++){ getchar(); renderdata(inputbyte,xpos,i*8); }
                for (i=0;i<numchars;i++){ renderdata(0xaa,xpos+1,i*8); }

            } // end else
            xpos++;
            if (xpos>xmax){xmax=xpos}
        }
        else if (chr(inputbyte)==="g"){ //ql500     //ql1060 uses compression, added decompression code
            print("g raster line data xpos="+xpos);
            getchar();
            byte1=inputbyte;
            getchar();
            byte2=inputbyte;
            numchars = byte2;
            print("numchars= "+numchars);
            if (compression){
                print("compression=on");
                count=0;
                expansionbufferpos=0;
                while(count < numchars){
                    getchar();
                    count++;
                    if (inputbyte >= 128){ 
                        repeatcount = (256-inputbyte)+1;
                        getchar();
                        count++;
                        for (i=0;i<repeatcount;i++){expansionbuffer[expansionbufferpos++]=inputbyte;}
                    }
                    else {
                        numchars0 = inputbyte + 1;
                        for (i=0;i<numchars0;i++){
                            getchar();
                            count++;
                            expansionbuffer[expansionbufferpos++]=inputbyte;
                        }  //end for
                    } // end else
                } // end while
                for (i=0;i<expansionbufferpos;i++) renderdata(expansionbuffer[i],xpos,i*8);
                for (i=0;i<expansionbufferpos;i++) renderdata(0xaa,xpos+1,i*8);
                println("expansionbufferlength="+expansionbufferpos);
            }  // end compression

            else {  // no compression
                println("compression=off");
                for (i=0;i<numchars;i++){ getchar(); renderdata(inputbyte,xpos,i*8); }
                for (i=0;i<numchars;i++){ renderdata(0xaa,xpos+1,i*8); }

            } // end else
            xpos++;
            if (xpos>xmax){xmax=xpos}
        }
        else if (chr(inputbyte)==="M"){
            println("M code");
            getchar_count(1);
            println("M = compression type "+inputbyte);
            if (inputbyte===2) {compression = 1; println("Setting Compression ON");}
        }

        else if (chr(inputbyte)==="Z"){
            println("Z raster line xpos=" + xpos);
            for (i=0;i<(384/8);i++)renderdata(0,xpos,i*8);
            for (i=0;i<162;i++)renderdata(0,xpos,i*8);          //QL1060
            for (i=0;i<(384/8);i++)renderdata(0xaa,xpos+1,i*8);
            xpos++;
            if (xpos>xmax){xmax=xpos}
        }
        else if ((inputbyte===26)||(inputbyte===3)){
            println("Form Feed");
        }
        else if (inputbyte===12){
            println("Form Feed FF 12");
            //reset xpos to zero
            xpos = 0;
            ypos += 8;   // because it's 5 strips + 8 dots = 128  5*24=120+8=128 dots
        }
        else if (inputbyte===13) {println("CR"); xpos = xmin;}
        else if (inputbyte===10) {println("LF"); ypos += 24;}
        //else { println("unrecognized code"+inputbyte.toString()); break;}
        else if (inputbyte===undefined) { println("inputbyte=undefined must be done");break;}
        else { println("unrecognized code at ("+file1pos+" input="+inputbyte+") exiting..."); return; break;}  // return will exit

        getchar();  //get char
        document.title = xpos+" "+ypos;
        everycounter += 1;
        if (everycounter>10) 
        {everycount = 0;
         break;
        }
    }// end for

    if ((inputbyte!==undefined)&&(inputbyte!=0)) setTimeout(processfile_loop,3)
    else {println("FINITO!");

          
          function copy_canvas_to_image(x,y,width,height){
              var myimage = document.createElement("img");
              var myimagedata = mycontext.getImageData(x,y,width,height);
              var mynewcanvas = document.createElement("canvas");
              var mynewcontext = mynewcanvas.getContext("2d");
              mynewcanvas.width=width;
              mynewcanvas.height=height;
              mynewcontext.putImageData(myimagedata,0,0);
              myimage.src = mynewcanvas.toDataURL("image/png");
              document.body.appendChild(myimage);
          }

          copy_canvas_to_image(0,0,xmax,ymax);

         } // end else
} // end processfile_loop

function processfile(){
    processfile_init();
    setTimeout(processfile_loop,0);  //start up the loop
}

