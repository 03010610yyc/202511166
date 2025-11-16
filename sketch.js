/*
By Okazz
*/
let colors = ['#f71735', '#067bc2', '#FFC247', '#3BD89F', '#81cfe5', '#f654a9', '#2F0A30'];
let ctx;
let centerX, centerY;
let strollers = [];
let menuWidth = 100; // 選單寬度
let menuHeight; // 每個選單項目高度
let menuX = -100; // 選單的 X 座標 (初始隱藏)
let targetMenuX = -100; // 選單的目標 X 座標
let menuY = 0; // 選單的 Y 座標 (從頂部開始)
let menuItems = [
	{ label: '單元一作業' ,url: " https://03010610yyc.github.io/20251109/" },
	{ label: '單元一筆記',url: " https://03010610yyc.github.io/20251109/"},
	{ label: '測驗卷' ,url: "https://03010610yyc.github.io/20251104/ "},
	{ label: '作品筆記' },
	{ label: '淡江大學', url: 'https://www.tku.edu.tw', subitems: [
		{ label: '教育科技學系', url: 'https://www.et.tku.edu.tw' }
	]},
	{ label: '關閉視窗' }
];
let selMenuItem = -1; // 當前選中的主選單項目索引
let selSubMenuItem = -1; // 當前選中的子選單項目索引
let iframe = null; // 用於儲存 iframe 元素

function setup() {
	createCanvas(windowWidth, windowHeight);
	rectMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	ctx = drawingContext;
	centerX = width / 2;
	centerY = height / 2;
	for (let i = 0; i < 21; i++) {
		let x = random(windowWidth);
		let y = random(windowHeight);
		strollers.push(new Wisp(x, y, width * random(0.05, 0.09), colors[i % colors.length]));
	}
}

function draw() {
	background('#fafaff');
	
	// 根據滑鼠位置決定選單是否滑出
	if (mouseX < 100) {
		targetMenuX = 0;
	} else {
		targetMenuX = -menuWidth;
	}
	// 平滑地移動選單
	menuX = lerp(menuX, targetMenuX, 0.2);

	// 根據視窗高度和項目數量計算每個選單項目的高度
	menuHeight = height / menuItems.length;

	// 繪製選單背景
	noStroke();
	fill(255, 50); // 白色，透明度 50
	rect(menuX + menuWidth / 2, height / 2, menuWidth, height);

	// 繪製選單項目
	textSize(16); // 文字大小保持 16px
	let currentY = menuY;
	for (let i = 0; i < menuItems.length; i++) {
		const item = menuItems[i];
		if (i === selMenuItem && selSubMenuItem === -1) {
			fill(colors[i % colors.length]); // 選中時使用彩色背景
			rect(menuX + menuWidth / 2, currentY + menuHeight / 2, menuWidth, menuHeight);
			fill(255); // 選中時文字為白色
		} else {
			fill(0); // 未選中時文字為黑色
		}
		text(item.label, menuX + 10, currentY + (menuHeight - 16) / 2); // 垂直居中文字

		// 繪製子選單
		if (i === selMenuItem && item.subitems) {
			let subMenuX = menuX;
			let subMenuY = currentY + menuHeight;

			for (let j = 0; j < item.subitems.length; j++) {
				const subItem = item.subitems[j];
				const subItemY = subMenuY + j * menuHeight;

				if (j === selSubMenuItem) {
					fill(colors[(i + j + 1) % colors.length]);
					rect(subMenuX + menuWidth / 2, subItemY + menuHeight / 2, menuWidth, menuHeight);
					fill(255);
				} else {
					fill(0);
				}
				text(subItem.label, subMenuX + 10, subItemY + (menuHeight - 16) / 2);
			}
			// 為子選單增加高度
			currentY += item.subitems.length * menuHeight;
		}

		currentY += menuHeight;
	}

	for (let s of strollers) {
		s.run();
	}


	for (let i = 0; i < strollers.length; i++) {
		let c1 = strollers[i];
		for (let j = i + 1; j < strollers.length; j++) {
			let c2 = strollers[j];
			let dx = c2.x - c1.x;
			let dy = c2.y - c1.y;
			let distance = sqrt(dx * dx + dy * dy);
			let minDist = c1.d + c2.d;

			if (distance < minDist && distance > 0) {
				let force = (minDist - distance) * 0.001;
				let nx = dx / distance;
				let ny = dy / distance;
				c1.vx -= force * nx;
				c1.vy -= force * ny;
				c2.vx += force * nx;
				c2.vy += force * ny;
			}
		}
	}


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved() {
	let overMainMenu = false;
	let overSubMenu = false;
	let currentY = menuY;

	selSubMenuItem = -1;

	for (let i = 0; i < menuItems.length; i++) {
		if (mouseX > menuX && mouseX < menuX + menuWidth && mouseY > currentY && mouseY < currentY + menuHeight) {
			selMenuItem = i;
			overMainMenu = true;
		}

		if (i === selMenuItem && menuItems[i].subitems) {
			const subMenuY = currentY + menuHeight;
			const subMenuHeight = menuItems[i].subitems.length * menuHeight;
			if (mouseX > menuX && mouseX < menuX + menuWidth && mouseY > subMenuY && mouseY < subMenuY + subMenuHeight) {
				overSubMenu = true;
				selSubMenuItem = floor((mouseY - subMenuY) / menuHeight);
			}
			currentY += subMenuHeight;
		}
		currentY += menuHeight;
	}

	if (!overMainMenu && !overSubMenu) {
		selMenuItem = -1;
	}
}

function mouseClicked() {
    // Function to create and display the iframe
    const showIframe = (url) => {
        if (iframe) {
            iframe.remove();
            iframe = null;
        }
        iframe = createElement('iframe');
        iframe.attribute('src', url);
        iframe.style('border', '2px solid black');
        iframe.position(width / 2 - 400, height / 2 - 300); // Center the iframe
        iframe.size(800, 600);
    };

    // Check if a menu item was clicked
	if (selMenuItem !== -1) {
		const mainItem = menuItems[selMenuItem];
		if (mainItem.subitems && selSubMenuItem !== -1) {
			// Clicked on a sub-menu item
			const subItem = mainItem.subitems[selSubMenuItem];
			if (subItem.url) {
				showIframe(subItem.url);
			}
		} else if (mainItem.url) { // This condition covers '淡江大學' and any other main item with a URL
			showIframe(mainItem.url);
		} else if (mainItem.label === '關閉視窗') {
			if (iframe) {
				iframe.remove();
				iframe = null;
			}
		}
	} else { // Clicked outside the menu, close iframe if open
		if (iframe) {
			iframe.remove();
			iframe = null;
		}
	}
}
function aetherLink(x1, y1, d1, x2, y2, d2, dst) {
	let r = dst / 2;
	let r1 = d1 / 2;
	let r2 = d2 / 2;
	let R1 = r1 + r;
	let R2 = r2 + r;
	let dx = x2 - x1;
	let dy = y2 - y1;
	let d = sqrt(dx * dx + dy * dy);
	if (d > R1 + R2) {
		return;
	}
	let dirX = dx / d;
	let dirY = dy / d;
	let a = (R1 * R1 - R2 * R2 + d * d) / (2 * d);
	let underRoot = R1 * R1 - a * a;
	if (underRoot < 0) return;
	let h = sqrt(underRoot);
	let midX = x1 + dirX * a;
	let midY = y1 + dirY * a;
	let perpX = -dirY * h;
	let perpY = dirX * h;
	let cx1 = midX + perpX;
	let cy1 = midY + perpY;
	let cx2 = midX - perpX;
	let cy2 = midY - perpY;

	if (dist(cx1, cy1, cx2, cy2) < r * 2) {
		return;
	}

	let ang1 = atan2(y1 - cy1, x1 - cx1);
	let ang2 = atan2(y2 - cy1, x2 - cx1);
	let ang3 = atan2(y2 - cy2, x2 - cx2);
	let ang4 = atan2(y1 - cy2, x1 - cx2);

	if (ang2 < ang1) {
		ang2 += TAU;
	}

	beginShape();
	for (let i = ang1; i < ang2; i += TAU / 180) {
		vertex(cx1 + r * cos(i), cy1 + r * sin(i));
	}

	if (ang4 < ang3) {
		ang4 += TAU;
	}
	for (let i = ang3; i < ang4; i += TAU / 180) {
		vertex(cx2 + r * cos(i), cy2 + r * sin(i));
	}
	endShape(CLOSE);
}

class Wisp {
	constructor(x, y, d, c) {
		this.x = x;
		this.y = y;
		this.d = d;
		this.vx = random(-1, 1) * width * 0.001;
		this.vy = random(-1, 1) * width * 0.001;
		this.ang = 0;
		this.rnd = random(10000);
		this.circles = [];
		this.timer = 0;
		this.color = c;
		this.angle = 0;
		this.pp = createVector(this.x, this.y);
	}

	show() {
		noStroke();
		fill(this.color);
		for (let c of this.circles) {
			c.run();
		}
		for (let i = 0; i < this.circles.length; i++) {
			let c = this.circles[i];
			if (c.isDead) {
				this.circles.splice(0, 1);
			}
			aetherLink(this.x, this.y, this.d, c.x, c.y, c.d, this.d * 0.2);
			for (let j = 0; j < this.circles.length; j++) {
			}
		}



		push();
		translate(this.x, this.y);
		rotate(this.angle);
		circle(0, 0, this.d);

		translate(this.d * 0.15, 0);
		rotate(-this.angle);
		fill('#ffffff');
		ellipse(-this.d * 0.22, -this.d * 0.02, this.d * 0.125, this.d * 0.15);
		ellipse(this.d * 0.22, -this.d * 0.02, this.d * 0.125, this.d * 0.15);
		ellipse(0, this.d * 0.05, this.d * 0.07, this.d * 0.09);
		
		pop();
	}

	update() {


		this.x += this.vx;
		this.y += this.vy;

		let r = this.d / 2
		if (this.x <= r || width - r <= this.x) {
			this.vx *= -1;
		}
		if (this.y <= r || height - r <= this.y) {
			this.vy *= -1;
		}

		this.x = constrain(this.x, r, width - r);
		this.y = constrain(this.y, r, height - r);


		if ((this.timer % 30) == 0) {
			this.circles.push(new Circle(this.x, this.y, this.d))
		}

		this.timer++;

		this.angle = atan2(this.y - this.pp.y, this.x - this.pp.x);
		this.pp = createVector(this.x, this.y);
	}

	run() {
		this.show();
		this.update();
	}
}


class Circle {
	constructor(x, y, d) {
		this.x = x;
		this.y = y;
		this.d = d;
		this.decrease = width * 0.0015;
		this.isDead = false;
		this.vx = random(-1, 1) * width * 0.0008;
		this.vy = random(-1, 1) * width * 0.0008;
	}

	show() {
		circle(this.x, this.y, this.d);
	}

	update() {
		this.d -= this.decrease;
		if (this.d < 0) {
			this.isDead = true;
		}
		this.d = constrain(this.d, 0, width);
		this.x += this.vx;
		this.y += this.vy;
	}

	run() {
		this.show();
		this.update();
	}
}
