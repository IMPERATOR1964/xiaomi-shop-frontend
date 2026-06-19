const A=require('adm-zip');const sharp=require('sharp');
const z=new A('C:/Users/safik/Desktop/aekk/Voltix_Frontend_Development (1).pptx');
async function patch(buf){
  const {width:W,height:H}=await sharp(buf).metadata();
  const wmW=Math.round(W*0.21),wmH=Math.round(H*0.12);
  const left=W-wmW, top=H-wmH;
  // цвет фона — слева от знака, та же высота
  const sx=Math.max(0,left-70);
  const rgb=await sharp(buf).extract({left:sx,top:top,width:Math.min(60,left-sx||60),height:wmH}).resize(1,1).raw().toBuffer();
  const [r,g,b]=[rgb[0],rgb[1],rgb[2]];
  const fill=await sharp({create:{width:wmW,height:wmH,channels:3,background:{r,g,b}}}).png().toBuffer();
  return await sharp(buf).composite([{input:fill,left,top}]).png().toBuffer();
}
(async()=>{
  const rels=z.getEntry('ppt/slides/_rels/slide3.xml.rels').getData().toString('utf8');
  const img=rels.match(/Id="rId2"[^>]*Target="\.\.\/(media\/image\d+\.png)"/)[1];
  const buf=z.getEntry('ppt/'+img).getData();
  const out=await patch(buf);
  const {width:W,height:H}=await sharp(out).metadata();
  await sharp(out).extract({left:W-450,top:H-110,width:450,height:110}).png().toFile('wm/patched3.png');
  console.log('готово, угол сохранён');
})();
