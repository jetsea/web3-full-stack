async function setupMovieNight() {
  console.log("开始准备电影之夜...");
  
  // 同时启动爆米花和饮料的准备
  const popcornPromise = cookPopcorn();  // 启动，不等待
  const drinksPromise = pourDrinks();    // 启动，不等待
  
  console.log("两项准备都在进行中...");
  

  const firstCompleted = await Promise.race([popcornPromise, drinksPromise]);
  await Promise.all([popcornPromise, drinksPromise]);
  console.log("所有准备完成，电影开始！");
  // 总耗时：约2秒（取两者中的最大值，而不是总和）
}

function cookPopcorn() {
  console.log("🍿 开始爆米花（需要3秒）...");
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("✅ 爆米花好了！");
      resolve();
    }, 3000);
  });
}

function pourDrinks() {
  console.log("🥤 开始倒饮料（需要1.5秒）...");
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("✅ 饮料倒好了！");
      resolve();
    }, 1500);
  });
}

setupMovieNight();