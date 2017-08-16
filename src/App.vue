<template>
	<div id="app" v-cloak>
		<div class="standard" :class="{'fullpage':fullpage}" v-if="isSupport">
			<div class="left-panel left">
				<div class="contact">
					<p class="logo">
						<img src="./assets/img/logo.png" alt="LOGO">
					</p>
					<div class="avatar">
						<img :src="userAvatar" alt="avatar">
						<p class="user-name">{{userName}}</p>
					</div>
					<div class="search">
						<a href="javascript:;"></a>
						<input type="text" v-model="searchContact">
					</div>
				</div>
				<div class="c-info">
					<ul>
						<li @click="changeSender(i,item.uid)" v-for="(item,i) in filteredContact" :class="{active:currentReceive == item.uid}" :key="i">
							<img :src="item.avatar" alt="">
							<p>{{item.nickname}}</p>
							<span class="tag" v-if="currentReceive != item.uid && item.unread != 0">{{item.unread}}</span>
						</li>
					</ul>
					<div v-if="!filteredContact.length" class="noone center">暂无最近联系人</div>
				</div>
			</div>
			<div class="right-panel right">
				<div class="top-nav">
					<ul>
						<li v-for="(item ,i) in topNav" v-if="!item.closed" :key="i">
							<a :href="item.url">
								<img :src="item.icon" alt="" :style="{'width':item.ad?'280px':'50px'}">
								<p v-if="item.name">{{item.name}}</p>
								<i v-if="item.ad" class="smallclose" @click="closeAd(item)"></i>
							</a>
						</li>
					</ul>
					<div class="tools right">
						<i @click="togglePage" class="expland"></i>
						<i @click="closeWindow" class="close"></i>
					</div>
				</div>
				<div class="chat-box">
					<div id="msgContent" class="chat-msg">
						<template v-for="(chatData,index) in historyChats">
							<div class="center" v-if="chatData.data.length >= 10 && chatData.contactId == currentReceive">
								<a class="maincolor" @click="loadMore(index)">加载更多</a>
							</div>
							<div v-if="chatData.contactId == currentReceive" class="main" v-for="(chat,i) in chatData.data" :class="{self:chat.isSelf == 1||chat.from_uid == uid}">
								<div class="avatar">
									<img :src="chat.from_avatar">
								</div>
								<div class="info">
									<span class="people">{{chat.username}}</span>
									<span class="time">{{chat.addtime | getTime}}</span>
								</div>
								<div class="text">
									<p v-html="chat.content"></p>
								</div>
							</div>
						</template>
						<div class="text-center">
							<span>以上为历史消息</span>
						</div>
						<template v-for="(chatData,index) in currentChat">
							<div v-if="chatData.contactId == currentReceive" class="main" v-for="(chat,i) in chatData.data" :class="{self:chat.isSelf == 1||chat.from_uid == uid}">
								<div class="avatar">
									<img :src="chat.from_avatar">
								</div>
								<div class="info">
									<span class="people">{{chat.username}}</span>
									<span class="time">{{chat.addtime | getTime}}</span>
								</div>
								<div class="text">
									<p v-html="chat.content"></p>
								</div>
							</div>
						</template>
					</div>
					<div class="chat-send">
						<div class="toolkits">
							<ul>
								<li>
									<i @click="toggleEmojiBox" class="emoji"></i>
									<!-- 表情 -->
									<div class="emoji-box" v-if="showEmoji">
										<ul class="box-ul">
											<li v-for="emoji in emojis">
												<span @click="addEmoji(emoji)">
													<img :src="'http://img.gongcing.com/default/face/'+emoji+'.png'" alt="">
												</span>
											</li>
										</ul>
										<div class="emoji-list">
											<ul>
												<li>
													<span>😀</span>
												</li>
											</ul>
										</div>
										<span class="tarng"></span>
									</div>
								</li>
								<li>
									<i class="file"></i>
									<form enctype="multipart/form-data" method="post" :action="pubUrl.uploadUrl">
										<input @change="uploadFile" name="image" accept="text/plain,application/*" id="uploadFile" type="file">
										<input type="hidden" name="file_name" value="im">
										<input type="hidden" name="up_id" value="1">
										<input type="hidden" name="uid" value="1">
										<input type="hidden" name="is_im" value="1">
									</form>
								</li>
								<li>
									<i class="pic"></i>
									<form enctype="multipart/form-data" method="post" :action="pubUrl.uploadUrl">
										<input @change="uploadImage" name="image" accept="image/*" id="uploadImage" type="file">
										<input type="hidden" name="file_name" value="im">
										<input type="hidden" name="up_id" value="1">
										<input type="hidden" name="uid" v-model="uid">
										<input type="hidden" name="is_im" value="1">
									</form>
								</li>
							</ul>
						</div>
						<editDiv :content="chatMsg" ref="chatBox" @keyToSend="listenKey" @range="saveCurrentRange" v-model='chatMsg'></editDiv>
						<div class="btns">
							<a @click="closeWindow" class="btn">结束对话</a>
							<a @click="sendMsg()" class="btn primary" href="#">发送</a>
						</div>
					</div>
				</div>
				<div class="info-box">
					<div class="info-tab">
						<el-tabs v-model="activeName" @tab-click="handleClick">
							<el-tab-pane label="最近浏览" name="first">
								<ul class="recent-view">
									<template v-if="recentView">
										<li v-for="(item,i) in recentView" :key="i">
											<a :href="item.goods_id">
												<div class="left">
													<img :src="pubUrl.imgUrl+item.goods_thumb" alt="">
												</div>
												<div class="info">
													<p :title="item.goods_title">{{item.goods_title}}</p>
													<span class="product-price price">{{item.goods_price}}</span>
													<a class="btn" @click="sendProduct(item)" href="javascript:;">发送</a>
												</div>
											</a>
										</li>
										<li class="history">
											<span>以上是历史消息</span>
										</li>
									</template>
									<li v-if="historyView" v-for="(item,i) in historyView" :key="i">
										<a :href="item.goods_id">
											<div class="left">
												<img :src="pubUrl.imgUrl+item.goods_thumb" alt="">
											</div>
											<div class="info">
												<p :title="item.goods_title">{{item.goods_title}}</p>
												<span class="price">{{item.goods_price}}</span>
												<a class="btn" @click="sendProduct(item)">发送</a>
											</div>
										</a>
									</li>
									<li v-else>
										暂无最近浏览商品
									</li>
								</ul>
							</el-tab-pane>
							<el-tab-pane label="订单信息" name="second">
								<div class="search-order">
									<div class="row">
										<span>下单时间：</span>
										<select name="" id="" v-model="searchTime">
											<option :value="1">最近一天</option>
											<option :value="2">最近一周</option>
											<option :value="3">最近一个月</option>
											<option :value="4">最近半年</option>
											<option :value="5">所有订单</option>
										</select>
									</div>
									<div class="row">
										<span>下单状态：</span>
										<select name="" id="" v-model="searchStatus">
											<option :value="1">全部</option>
											<option :value="2">待付款</option>
											<option :value="3">待发货</option>
											<option :value="4">待收货</option>
											<option :value="5">待评价</option>
											<option :value="6">待合同确认</option>
											<option :value="6">售后中</option>
											<option :value="6">已取消</option>
										</select>
									</div>
									<div class="row center">
										<a class="btn primary" @click="searchOrderAction">查询</a>
									</div>
								</div>
								<div class="history">
									<span>查询结果</span>
								</div>
								<ul class="order-searched">
									<template v-if="searchOrder">
										<li v-for="(item,i) in searchOrder" :key="i">
											<a :href="item.order_id">
												<div class="left">
													<img :src="item.goods_thumb" alt="">
												</div>
												<div class="info">
													<p class="order-id" :title="item.order_sn">订单号：{{item.order_sn}}</p>
													<p class="order-price">实付：
														<span class="price">{{item.order_total_price}}</span>
													</p>
													<span class="date">{{item.addtime | getTime('YY-MM-DD')}}</span>
													<span class="status">{{item.order_status}}</span>
												</div>
											</a>
										</li>
									</template>
								</ul>
							</el-tab-pane>
							<el-tab-pane label="常见问题" name="third">
								<div class="common-problems">
									<el-collapse v-model="activeQuestion" accordion>
										<el-collapse-item :name="i" v-for="(item,i) in questionLists" :key="i">
											<template slot="title">
												<i class="gci-info"></i>
												<span :title="item.title">{{item.title}}</span>
											</template>
											<div>{{item.desc}}</div>
										</el-collapse-item>
									</el-collapse>
									<div class="see-more">
										<p class="fz-10">没找到想问的问题？点此
											<a href="">查看更多</a>问题~</p>
										<div class="app">
											<img src="./assets/img/app.png" alt="">
											<p>
												手机扫一扫下载攻城APP，服务快捷更方便，更有新人礼包送
											</p>
										</div>
									</div>
								</div>
							</el-tab-pane>
						</el-tabs>
					</div>
				</div>
			</div>
		</div>
		<div v-if="showEmoji" class="bg-wrapper" @click="toggleEmojiBox"></div>
		<div v-if="!isSupport" class="errorPage">
			<img src="./assets/img/error.png" alt="">
			<p>IM暂不支持ie9及以下浏览器哦~</p>
		</div>
	</div>
</template>

<script>
import editDiv from './components/editable.vue';
import {
	getCookie
} from './unit/cookies'
//导航url
const navUrl = {
	order: 'http://up.gongcing.com/up.html'
}
export default {
	name: 'app',
	components: {
		editDiv
	},
	data() {
		return {
			emojis: ["angry-face",
				"anguished",
				"astonished-face",
				"confounded-face",
				"confused-face",
				"disappointed-but-relieved-face",
				"disappointed-face",
				"dizzy-face",
				"drooling-face",
				"expressionless-face",
				"face-savouring-delicious-food",
				"face-screaming-in-fear",
				"face-throwing-a-kiss",
				"face-with-cold-sweat",
				"face-with-cowboy-hat",
				"face-with-finger-covering-closed-lips",
				"face-with-look-of-triumph",
				"face-with-medical-mask",
				"face-with-monocle",
				"face-with-one-eyebrow-raised",
				"face-with-open-mouth",
				"face-with-open-mouth-and-cold-sweat",
				"face-without-mouth",
				"face-with-rolling-eyes",
				"face-with-stuck-out-tongue",
				"face-with-stuck-out-tongue-and-tightly-closed-eyes",
				"face-with-stuck-out-tongue-and-winking-eye",
				"face-with-tears-of-joy",
				"face-with-thermometer",
				"fearful-face",
				"flushed-face",
				"frowning-face-with-open-mouth",
				"grimacing-face",
				"grinning-face",
				"grinning-face-with-one-large-and-one-small-eye",
				"grinning-face-with-smiling-eyes",
				"grinning-face-with-star-eyes",
				"hugging-face",
				"hushed-face",
				"kissing-face",
				"kissing-face-with-smiling-eyes",
				"loudly-crying-face",
				"lying-face",
				"money-mouth-face",
				"nauseated-face",
				"nerd-face",
				"neutral-face",
				"pensive-face",
				"persevering-face",
				"pile-of-poo",
				"pouting-face",
				"relieved-face",
				"rolling-on-the-floor-laughing",
				"sleeping-face",
				"sleepy-face",
				"slightly-frowning-face",
				"slightly-smiling-face",
				"smiling-face-with-heart-shaped-eyes",
				"smiling-face-with-open-mouth",
				"smiling-face-with-open-mouth-and-cold-sweat",
				"smiling-face-with-open-mouth-and-smiling-eyes",
				"smiling-face-with-open-mouth-and-tightly-closed-eyes",
				"smiling-face-with-smiling-eyes",
				"smiling-face-with-smiling-eyes-and-hand-covering-mouth",
				"smiling-face-with-sunglasses",
				"smirking-face",
				"sneezing-face",
				"thinking-face",
				"tired-face",
				"unamused-face",
				"upside-down-face",
				"weary-face",
				"white-frowning-face",
				"white-smiling-face",
				"winking-face",
				"worried-face",
				"zipper-mouth-face"],
			pubUrl: {
				imgUrl: 'http://img.gongcing.com',//图片服务器地址
				uidGeter: '',//通过uid获取消息
				uploadUrl: 'http://up.gongcing.com/up.html',//上传
				getUserInfo: 'http://gcwww.2vnet.net/v1/Im/getUserInfo',//用户信息
				getConcactUrl: 'http://gcwww.2vnet.net/v1/Im/getRecentContacts',//联系人信息
				recentMsg: 'http://gcwww.2vnet.net/v1/Im/getRecentContactsMessage',//最近消息
				recentProduct: 'http://gcwww.2vnet.net/v1/Im/getUserVisitGoods',//最近浏览商品
				questionsUrl: 'http://gcwww.2vnet.net/v1/Im/getQuestion',//常见问题
				getUserOrder: 'http://gcwww.2vnet.net/v1/Im/getUserOrder',//订单筛选
			},
			//请求数据
			topNav: [{
				url: navUrl.order,
				icon: './src/assets/img/order.png',
				name: '我的订单'
			}, {
				url: '',
				icon: './src/assets/img/edit.png',
				name: '修改订单'
			}, {
				url: '',
				icon: './src/assets/img/switch.png',
				name: '退换货'
			}, {
				url: '',
				icon: './src/assets/img/fix.png',
				name: '维修保养'
			}, {
				url: '',
				icon: './src/assets/img/questionnaire.png',
				name: '问卷调查'
			}, {
				url: 'javascript:;',
				icon: './src/assets/img/ad.png',
				ad: true,
			}],
			userAvatar: 'http://img.gongcing.com/default/no_avatar.png',
			userName: '用户名',
			contactList: [],
			currentChat: [],
			historyChats: [],
			recentView: [],
			historyView: [],
			searchOrder: [
				// 	{//订单
				// 	"order_id": 1,//订单ID
				// 	"order_sn": 2,//订单编号
				// 	"order_total_price": 333.25,//订单总价
				// 	"order_status": "已完成",
				// 	"goods_thumb": "/thumb/filenmame.jpg",//商品主图URL
				// 	"addtime": 2231231234//添加时间
				// }
			],
			questionLists: [],
			//自建数据
			showEmoji: false,//emoji框
			currentReceive: Number,//当前接收人
			chatMsg: '',
			uid: 7,//userId
			// uid: 7,//userId
			sid: 'TJEqzMVsM7jPJ9iJCeqPNAZQoZtgqp8l7K1cp43',
			userType: 1,
			// userType: 1,
			activeQuestion: '',
			currentSelect: 0, //当前选中的用户默认0
			activeName: 'first', //tab切换
			searchContact: '', //搜索框
			isSupport: true,//是否支持websocket
			fullpage: 0,//全屏
			searchTime: 1,
			searchStatus: 1,
		}
	},
	created() {
		let self = this;
		if (!window.WebSocket) {
			self.isSupport = false;
		}
		//检测是否登录 开发时暂时注释
		// this.checkIsLogin();
		const receiveUid = window.location.search.indexOf('uid') == -1 ? alert('参数错误') : window.location.search.match(/(uid=)(\d+)/)[2];
		self.currentReceive = +receiveUid;
		$.ajax({
			url: self.pubUrl.getUserInfo,
			type: 'post',
			data: {
				uid: self.uid,
				sid: self.sid,
				type: self.userType
			},
			success: (re) => {
				let res = JSON.parse(re);
				if (res.code == 1) {
					self.userAvatar = self.pubUrl.imgUrl + res.data.avatar;
					self.userName = res.data.nickname;
				}
				// else if (res.code == 9) {
				// 	self.$message.error(res.message);
				// 	self.redirectLogin();
				// }
				else {
					self.$message.error(res.message);
				}
			},
			error: function (e) {
				console.log(e);
			}
		}).then(function () {
			self.initws()
		}).then(function () {
			//获取最近联系人
			$.ajax({
				url: self.pubUrl.getConcactUrl,
				type: 'post',
				data: {
					uid: self.uid,
					sid: self.sid,
					type: self.userType,
					to_uid: self.currentReceive,
				},
				success: (re) => {
					let res = JSON.parse(re);
					if (res.code == 1) {
						console.log('最近联系人获取成功！');
						res.data.filter(function (item) {
							item.avatar = self.pubUrl.imgUrl + item.avatar;
							item.unread = 0;
						})
						self.contactList = res.data;
						self.getRecentMsg(self.currentReceive);
					} else {
						self.$message.error(res.message);
					}
				}
			})
			//获取最近商品
			$.ajax({
				url: self.pubUrl.recentProduct,
				type: 'post',
				data: {
					sid: self.sid,
					type: self.userType
				},
				success: re => {
					let res = JSON.parse(re);
					if (res.code == 1) {
						self.recentView = res.data.visit_goods_data_new;
						self.historyView = res.data.visit_goods_data_old;
					}
				}
			})
			$.ajax({
				url: self.pubUrl.questionsUrl,
				type: 'post',
				data: {
					sid: self.sid,
					type: self.userType
				},
				success: re => {
					let res = JSON.parse(re);
					if (res.code == 1) {
						self.questionLists = res.data;
					}
				}
			})
		}).fail((xhr, status, error) => {
			console.log(`xhr:${xhr},status:${status},error:${error}`)
		});
		console.log('already created!');
	},
	mounted() {
		console.log('already mounted!');
		let self = this;
		window.addEventListener('message', function (e) {
			if (e.origin == 'http://up.gongcing.com') {
				let re = JSON.parse(e.data);
				if (re.code == 1 && re.data.pic != '') {
					self.sendMsg(`<img src="http://img.gongcing.com/${re.data.pic}">`, false);
					self.scrollBottom();
				} else {
					alert('上传失败!')
				}
			}
		}, false);
		$('body').on('click', '.chat-msg .text p>img', function (e) {
			self.$msgbox({
				title: ' ',
				message: self.$createElement('p', {
					style: { textAlign: 'center' }
				}, [self.$createElement('img', {
					attrs: { 'src': e.currentTarget.src }
				}),
					]),
				showConfirmButton: false,
			}).catch(e => {
			});
		});
	},
	methods: {
		//获取联系人列表并筛选出第几位加上标记
		filterContactIndex(id) {
			let target = this.contactList;
			let index;
			target.filter(function (item, i) {
				if (item.uid == id) {
					index = i;
				}
			})
			return index;
		},
		//订单搜索
		searchOrderAction() {
			let self = this;
			// event.target
			$.ajax({
				url: self.pubUrl.getUserOrder,
				type: 'post',
				data: {
					sid: self.sid,
					type: self.userType,
					order_time: self.searchTime,
					order_type: self.searchStatus,
				},
				success: re => {
					let res = JSON.parse(re);
					if (res.code == 1) {
						self.searchOrder = res.data;
					}
				}
			})
		},
		//获取最近消息
		// flag为在历史消息里的索引如果没有就传'noMsg'
		//cb为回调
		getRecentMsg(id, flag, cb) {
			let self = this;
			// let i;
			// self.historyChats.filter(function (item, index) {
			// 	if (item.received == id) {
			// 		return i = index;
			// 	}
			// })
			if (flag == undefined) {
				$.ajax({
					url: self.pubUrl.recentMsg,
					type: 'post',
					data: {
						sid: self.sid,
						contact_uid: id || self.currentReceive,
						type: self.userType,
						page: 1
					},
					success: re => {
						let res = JSON.parse(re);
						if (res.code == 1) {
							let msg = self.filterWithUid(self.historyChats, res.data);
							self.historyChats.push(msg);
							self.scrollBottom();
						}
					}
				})
			} else {
				var target = self.historyChats[flag];
				$.ajax({
					url: self.pubUrl.recentMsg,
					type: 'post',
					data: {
						sid: self.sid,
						contact_uid: id || self.currentReceive,
						type: self.userType,
						page: ++target.page
					},
					success: re => {
						let res = JSON.parse(re);
						if (res.code == 1) {
							let msg = self.filterWithUid(self.historyChats, res.data);
							if (msg.data.length) {
								target.data = msg.data.concat(target.data);
								target.page++;
							} else {
								if (typeof (cb) == 'function') {
									cb();
								}
							}

						}
					}
				})
			}
		},
		//根据uid分类
		// target:目标对象 
		// unhandledData:需要处理的对象
		filterWithUid(target, unhandledData) {
			let items = target;
			let self = this;
			//判断是否是数组
			if (Array.isArray(unhandledData)) {
				//如果历史消息有内容
				let tempObj = {
					contactId: self.currentReceive,
					data: [],
					page: 1,
					// unreadMsgCount: 0
				};
				unhandledData.filter(function (item, index) {

					// 	//先判断是否存在于tempArr中
					// 	// flag标记是否存在联系人id，存在为true，否则false
					// 	let flag = 0;
					// 	let i;
					// 	if (tempArr.length) {
					// 		tempArr.filter(function (tempItem, tempIndex) {
					// 			if (tempItem['contactId'] == item.to_uid) {
					// 				flag++;
					// 				i = tempIndex;
					// 				return false;
					// 			}
					// 		})
					// 	}
					// 	if (flag) {
					// 		tempArr[i]['data'].push(item);
					// 	} else {
					tempObj['data'].push(item);
					// console.log(tempObj);
					// 	}
				});
				tempObj.data = tempObj.data.reverse();
				tempObj = Object.assign({}, tempObj);
				console.log(tempObj);
				return tempObj;
				//非数组外的object
			} else if (unhandledData !== null && typeof unhandledData === 'object') {
				//判断当前对象的id是否存在
				//是否是未读消息判断
				var isUnread = 0;
				var _uid;

				if (unhandledData.to_uid) {
					_uid = unhandledData.to_uid
				} else {
					_uid = unhandledData.from_uid
					isUnread = 1;
				}
				var i = self.getContactIdIndex(items, _uid);
				let flagUnreadIndex = self.filterContactIndex(_uid);

				if (i != undefined) {
					// TODO
					//处理未读消息，先标记后处理
					if (isUnread && self.currentReceive != _uid) {
						target[i].unread.push(unhandledData);
						self.contactList[flagUnreadIndex].unread++;
					} else {
						target[i].data.push(unhandledData);
					}
				} else {
					if (isUnread && self.currentReceive != _uid) {
						self.contactList[flagUnreadIndex].unread++;
					}
					target.push({
						contactId: _uid,
						data: [unhandledData],
						unread: []
					});
				}
			}
		},
		//通过联系人id获取在第几位
		getContactIdIndex(target, id) {
			var key;
			if (target.length) {
				target.filter(function (item, i) {
					if (item.contactId == id) {
						// console.log(i);
						key = i;
					}
				})
			}
			return key;
		},
		//判断是否登录
		checkIsLogin() {
			//用户id
			let _uid = getCookie('uid');
			//session id
			let _sid = getCookie('sid');
			//
			let _ut = getCookie('userType');

			if (!_uid || !_sid || !_ut) {
				alert('请重新登录！');
				this.redirectLogin();
			} else {
				this.uid = JSON.parse(_uid).uid;
				this.sid = JSON.parse(_sid).sid;
				this.userType = JSON.parse(_ut).userType;
			}
		},
		redirectLogin() {
			let url = encodeURIComponent(window.location.href);
			window.location.href = 'http://web-dev.2vnet.net/pc/SSO/login.html?pageurl=' + url;
		},
		//初始化websocket
		initws() {
			let self = this;
			let ws = new WebSocket("ws://211.149.152.91:8282");
			ws.onopen = function () {
				ws.send(JSON.stringify({
					"type": "init",//init：初始化IM请求
					"uid": self.uid,//登陆用户的UID
					"username": self.userName,//登陆用户的用户名 默认是手机号码
					"avatar": self.userAvatar,//登陆用户的头像信息
					"sign": ''
				}));
			};

			ws.onmessage = function (evt) {
				let received_msg = evt.data;
				let msg = JSON.parse(received_msg);
				if (msg.message_type == 'chatMessage') {
					// TODO
					self.filterWithUid(self.currentChat, msg.data);
					// self.currentChat.push(re);
					self.scrollBottom();
				}
				if (msg.message_type == 'logMessage') {
					self.filterWithUid(self.currentChat, msg.data);
					// let index = self.getContactIdIndex(self.historyChats, log.data.from_uid);
					// self.unReadMsg.push(log);
					self.scrollBottom();
				}
			};

			ws.onclose = function () {
				// 关闭 websocket
				// alert("服务器错误，无法即时通讯！");
			};
			self.$ws = ws;
		},
		//关闭广告
		closeAd(item) {
			this.$set(item, 'closed', 1);
		},
		//切换tabs
		handleClick(tab, event) {
			// console.log(tab, event);
		},
		//关闭窗口 chrome无法实现，只能跳转到空白页
		closeWindow() {
			try {
				window.open('', '_self', '');
				window.close();
				window.location.href = 'about:blank';
			} catch (e) {
				console.log(e);
			}
		},
		//上传文件目前：text，office3个
		uploadFile(e) {
			if (e.target.value) {
				if (this.checkUpload(e.target, 'file', 2)) {
					this.uploading(e.target);
				}
			} else {
				this.$message({
					message: '请选择内容！',
					type: 'error'
				})
			}
		},
		//上传图片
		uploadImage(e) {
			if (e.target.value) {
				if (this.checkUpload(e.target, 'pic', 2)) {
					this.uploading(e.target);
				}
			} else {
				this.$message({
					message: '请选择一张图片！',
					type: 'error'
				})
			}
		},
		//检测大小以及类型
		// 单位默认为m
		checkUpload(file, type, size, unit = 'm') {
			if (size && unit) {
				var fileSize = file.files[0].size;
				if (unit == 'm') {
					fileSize = fileSize / 1024 / 1024;
				}
				if (fileSize > size) {
					alert(`文件大小超过上传限制！请控制在${size}${unit}以内！`);
					return false;
				}
			}
			if (type == 'file') {
				if (!/\.(txt|xlsx?|docx?|pptx?|TXT|XLSX?|DOCX?|PPTX?)$/.test(file.value) && !/\.(txt|xlsx?|docx?|pptx?|TXT|XLSX?|DOCX?|PPTX?)$/.test(file.files[0].type)) {
					this.$message({
						message: '请选择一个文件！',
						type: 'error'
					})
					return false;
				} else {
					return true;
				}
			}
			if (type == 'pic') {
				if (!/\.(jpg|jpeg|png|gif|bmp|JPG|JPEG|PNG|GIF|BMP)$/.test(file.value) && !/\.(jpg|jpeg|png|gif|bmp|JPG|JPEG|PNG|GIF|BMP)$/.test(file.files[0].type)) {
					this.$message({
						message: '请选择图片类型的文件！',
						type: 'error'
					})
					return false;
				} else {
					return true;
				}
			}
		},
		//上传文件或图片
		uploading(item) {
			let self = this;
			let form = $(item).parent('form')[0];
			if ($('#uploadFrame').length == 0) {
				$("body").append("<iframe id='uploadFrame' name='uploadFrame'></iframe>");
			}
			form.target = "uploadFrame";
			form.submit();
			setTimeout(function () {
				form.reset();
			}, 1000);
			$("iframe[name='uploadFrame']").css('display', 'none');
		},
		//添加emoji
		addEmoji(item) {
			this.$nextTick(function () {
				let url = 'http://img.gongcing.com/default/face/';
				let str = `<img src="${url}${item}.png"></img>`;
				// this.$refs.chatBox.$el.focus();
				this.restoreSelection();
				if (this.range) {
					document.execCommand('insertImage', false, `${url}${item}.png`)
				}

				this.toggleEmojiBox();
			})

		},
		//切换表情窗口
		toggleEmojiBox() {
			this.showEmoji = !this.showEmoji;
			this.$nextTick(function () {
				//计算高度
				let wrapper_height = document.body.scrollHeight;
				$('.bg-wrapper').css({
					height: wrapper_height
				})
			})
		},
		//检测消息
		checkMsg(msg = this.chatMsg) {
			let reg = /(<br>)+/;
			msg = msg.replace(reg, '');
			if (msg == '') {
				return false
			}
			return true
		},
		//发送消息如果不传msg就默认this.chatMsg
		// isClear是否清除消息默认true
		sendMsg(msg = this.chatMsg, isClear = true) {
			if (!this.checkMsg(msg)) {
				this.$message({
					type: 'error',
					message: '请输入内容'
				});
				return false;
			}
			this.$ws.send(JSON.stringify({
				"type": "chatMessage",//chatMessage告知服务端该请求类型为即时聊天
				"data": {
					"to": {
						"type": 1,//1为单对单对话 2为群组对话(暂时关闭)
						"uid": this.currentReceive //聊天的对象用户UID
					},
					"mine": {//自己发送的内容
						"content": msg//内容
					}
				}
			}));
			this.filterWithUid(this.currentChat, {
				isSelf: 1,
				to_uid: this.currentReceive,
				content: msg,
				username: this.userName,
				addtime: parseInt(new Date().getTime() / 1000),
				from_avatar: this.userAvatar
			});
			if (isClear) {
				this.$refs.chatBox.getMsg('');
			}
			this.scrollBottom();
		},
		//保存range
		saveCurrentRange() {
			let this$1 = this;

			let selection = window.getSelection ? window.getSelection() : document.getSelection();
			if (!selection.rangeCount) {
				return
			}
			let content = this.$refs.chatBox.$el;
			for (let i = 0; i < selection.rangeCount; i++) {
				let range = selection.getRangeAt(0);
				let start = range.startContainer;
				let end = range.endContainer;
				// for IE11 : node.contains(textNode) always return false
				start = start.nodeType === Node.TEXT_NODE ? start.parentNode : start;
				end = end.nodeType === Node.TEXT_NODE ? end.parentNode : end;
				if (content.contains(start) && content.contains(end)) {
					this$1.range = range;
					break
				}
			}
		},
		//重构selection
		restoreSelection() {
			let selection = window.getSelection ? window.getSelection() : document.getSelection();
			selection.removeAllRanges();
			if (this.range) {
				selection.addRange(this.range);
			} else {
				let content = this.$refs.chatBox.$el;
				let div = document.createElement('div');
				let range = document.createRange();
				content.appendChild(div);
				range.setStart(div, 0);
				range.setEnd(div, 0);
				selection.addRange(range);
				this.range = range;
			}
		},
		//检测换行和回车发送
		listenKey(e) {
			if (e.ctrlKey && e.keyCode == 13) {
				this.restoreSelection();
				if (this.range) {
					document.execCommand('insertHTML', false, '<br><br>');
					this.scrollBottom('#im-editor');
				}
				return false;
			}
			if (e.keyCode == 13) {
				e.preventDefault();
				this.sendMsg();
				return false;
			}
		},
		//滚动到底部默认为msgContent
		scrollBottom(el = '#msgContent') {
			this.$nextTick(function () {
				setTimeout(() => {
					let container = this.$el.querySelector(el);
					container.scrollTop = container.scrollHeight + 40;
				}, 200)

			});
		},
		//改变对话人
		changeSender(index, id) {
			event.preventDefault();
			if (this.currentReceive == id) return;
			this.currentReceive = id;
			this.contactList[index].unread = 0;
			let flag = this.getContactIdIndex(this.historyChats, this.currentReceive);
			if (flag == undefined) {
				this.getRecentMsg(this.currentReceive, flag);
			} else {
				var currentIndex = this.getContactIdIndex(this.currentChat, this.currentReceive);
				if (currentIndex != undefined) {
					if (!!this.currentChat[currentIndex].unread.length) {
						this.currentChat[currentIndex].data = this.currentChat[currentIndex].data.concat(this.currentChat[currentIndex].unread);
						this.currentChat[currentIndex].unread = [];
					}
				}
			}
			this.scrollBottom();
			return false;
		},
		//切换全屏
		togglePage() {
			this.fullpage = !this.fullpage;
		},
		//发送商品
		sendProduct(item) {
			let content = `<div class="product-info">
								<a href="${item.goods_id}">
									<img src="${this.pubUrl.imgUrl}${item.goods_thumb}" />
									<p>${item.goods_title}</p>
								</a>
							</div>`;
			this.sendMsg(content);
		},
		//加载更多
		loadMore(index) {
			let e = event;
			console.log(e);
			this.getRecentMsg(this.currentReceive, index, function () {
				e.target.parentNode.innerHTML = '<span>没有更多消息了~</span>'
			});
		}
	},
	filters: {
		getTime(uData, returnStyle = 'YY-MM-DD hh:mm:ss') {
			let myDate = new Date(uData * 1000);
			let year = myDate.getFullYear();
			let month = myDate.getMonth() + 1;
			let day = myDate.getDate();
			let hh = myDate.getHours();
			let mm = myDate.getMinutes();
			let ss = myDate.getSeconds();
			month = month < 10 ? `0${month}` : month;
			day = day < 10 ? `0${day}` : day;
			hh = hh < 10 ? `0${hh}` : hh;
			mm = mm < 10 ? `0${mm}` : mm;
			ss = ss < 10 ? `0${ss}` : ss;
			if (returnStyle === "YY-MM-DD") {
				return `${year}-${month}-${day}`;
			}
			if (returnStyle === "YY-MM-DD hh:mm:ss" || !returnStyle) {
				return `${year}-${month}-${day}  ${hh}:${mm}:${ss}`;
			}
		}
	},
	computed: {
		//联系人筛选
		filteredContact: function () {
			let self = this;
			if (self.contactList.length == 0) return false;
			return self.contactList.filter(function (item) {
				return item.nickname.indexOf(self.searchContact) !== -1
			})
		}
	}
}
</script>

<style lang="scss">
@import "assets/css/base.css";
@mixin border-radius($radius) {
	-webkit-border-radius: $radius;
	border-radius: $radius;
	background-clip: padding-box;
	/* stops bg color from leaking outside the border: */
}

@mixin text-overflow($lines) {
	@if($lines > 1) {
		word-break: break-all;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	@if($lines==1) {
		white-space: nowrap;
		-o-text-overflow: ellipsis;
	}
	overflow: hidden;
	text-overflow: ellipsis;
}

$maincolor: #ff5517;
$bgcolor: #F5F5F5;
$bdcolor: #dadada;
$black: #333;
$fontcolor: #666;
$lightfontcolor: #999;
$darkfontcolor:333;
$chatbg: #ffede7;
$tabbg: #E7E7E7;

* {
	box-sizing: border-box;
	outline: none;
}

.left {
	float: left;
}

.right {
	float: right;
}

.center {
	text-align: center;
}

.price {
	color: $maincolor;
	&:before {
		content: '￥';
		font-size: inherit;
	}
}

[contentEditable=true]:empty:not(:focus):before {
	content: attr(data-text);
	color: $fontcolor;
}

[v-cloak] {
	display: none;
}

//全局emoji字体大小
// .emoji- {
// 	font-size: 20px;
// }
.bg-wrapper {
	width: 100%;
	height: 90vh;
	display: block;
	opacity: 0;
}

.errorPage {
	text-align: center;
	position: absolute;
	left: 50%;
	top: 50%;
	margin-top: -294px;
	margin-left: -260px;
	p {
		font-size: 36px;
		color: #e55656;
	}
}

.standard {
	width: 1250px;
	height: 720px;
	top: 50%;
	left: 50%;
	margin-top: (calc(-720px / 2));
	margin-left: (calc(-1250px / 2));
	position: absolute;
	box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.50);
	&.fullpage {
		height: 100vh;
		width: 100%;
		min-width: 1250px;
		margin: 0;
		top: 0;
		left: 0;
		overflow: hidden;
	}
}

.left-panel {
	width: 300px;
	position: relative;
	height: 100%;
}

.contact {
	width: 100%;
	height: 170px;
	padding: 10px 20px 20px;
	background: rgba(255, 139, 50, 1);
	background: -moz-linear-gradient(-45deg, rgba(255, 139, 50, 1) 0%, rgba(255, 85, 23, 1) 100%);
	background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(255, 139, 50, 1)), color-stop(100%, rgba(255, 85, 23, 1)));
	background: -webkit-linear-gradient(-45deg, rgba(255, 139, 50, 1) 0%, rgba(255, 85, 23, 1) 100%);
	background: -o-linear-gradient(-45deg, rgba(255, 139, 50, 1) 0%, rgba(255, 85, 23, 1) 100%);
	background: -ms-linear-gradient(-45deg, rgba(255, 139, 50, 1) 0%, rgba(255, 85, 23, 1) 100%);
	background: linear-gradient(135deg, rgba(255, 139, 50, 1) 0%, rgba(255, 85, 23, 1) 100%);
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ff8b32', endColorstr='#ff5517', GradientType=1);
	.logo {
		height: 28px;
	}
	.avatar {
		margin: 10px 0;
		height: 60px;
		overflow: hidden;
		img {
			width: 60px;
			height: 60px;
			margin-right: 20px;
			@include border-radius(50%);
			float: left;
		}
		.user-name {
			font-size: 22px;
			color: #fff;
			line-height: 60px;
			@include text-overflow(1);
		}
	}
	.search {
		background: url("./assets/img/search-bg.png") no-repeat;
		width: 100%;
		height: 32px;
		position: relative;
		input {
			position: absolute;
			border: 0;
			left: 35px;
			height: 30px;
			width: 195px;
			top: 1px;
			font-size: 14px;
		}
		a {
			width: 18px;
			height: 32px;
			display: inline-block;
			background: url("./assets/img/search.png") center no-repeat;
			margin-left: 10px;
		}
	}
}

.fullpage {
	.right-panel {
		width: (calc(100% - 300px));
		height: 100%;
		position: relative;
		.expland {
			background: url("./assets/img/collapse.png") center no-repeat !important;
		}
		.chat-box {
			width: calc(100% - 310px);
			height: calc(100vh - 128px);
			.chat-msg {
				height: calc(100% - 200px);
			}
		}
		.info-box {
			height: calc(100vh - 128px);
		}
	}
	.c-info {
		height: (calc(100% - 170px));
	}
}

.c-info {
	height: 550px;
	width: 100%;
	background-color: $bgcolor;
	overflow-y: auto;
	>ul>li {
		padding: 10px 20px;
		position: relative;
		cursor: pointer;
		&:hover {
			background: rgba(255, 255, 255, .6);
		}
		img {
			width: 60px;
			height: 60px;
			margin: 10px 20px;
			@include border-radius(50%);
			float: left;
			border: 1px solid #fff;
		}
		p {
			font-size: 18px;
			color: $black;
			line-height: 80px;
			@include text-overflow(1);
		}
		&.active {
			background: #fff;
			img {
				border-color: $bdcolor;
			}
		}
		.tag {
			position: absolute;
			right: 20px;
			line-height: 12px;
			color: #fff;
			top: 50%;
			margin-top: -8px;
			background: #FF5317;
			height: 16px;
			padding: 2px;
			display: inline-block;
			min-width: 16px;
			text-align: center;
			@include border-radius(50%);
		}
	}
	.noone {
		padding: 20px 0;
		color: $lightfontcolor;
	}
}

.right-panel {
	width: 950px;
	height: 720px;
	position: relative;
	.top-nav {
		padding: 28px 20px;
		background-color: $bgcolor;
		z-index: 10;
		width: 100%;
		float: left;
		ul {
			display: inline-block;
			li {
				display: inline-block;
				text-align: center;
				padding: 0 20px;
				vertical-align: middle;
				position: relative;
				p {
					font-size: 14px;
					color: $fontcolor;
				}
				.smallclose {
					background: url("./assets/img/closaad.png") center no-repeat;
					width: 14px;
					height: 14px;
					position: absolute;
					right: 20px;
					top: 0;
					cursor: pointer;
				}
			}
		}
		.tools {
			display: inline-block;
			vertical-align: middle;
			line-height: 72px;
			.close,
			.expland {
				width: 24px;
				height: 24px;
				margin-left: 40px;
				display: inline-block;
				vertical-align: middle;
				cursor: pointer;
				&:first-child {
					margin-left: 0;
				}
			}
			.expland {
				background: url("./assets/img/full.png") center no-repeat;
			}
			.close {
				background: url("./assets/img/close.png") center no-repeat;
			}
		}
	}
	.chat-box {
		width: 640px;
		height: 590px;
		position: relative;
		float: left;
		.chat-msg {
			width: 100%;
			height: 390px;
			padding: 20px;
			overflow-y: auto;
			.main {
				margin-top: 10px;
				.product-info {
					position: relative;
					img {
						max-width: 100px;
						max-height: 100px;
						position: absolute;
					}
					p {
						margin-left: 110px;
						min-height: 100px;
						min-width: 150px;
					}
				}
				.avatar {
					float: left;
					width: 40px;
					height: 40px;
					margin: 0 10px 0 0;
					@include border-radius(50%);
					border: 2px solid $bdcolor;
					overflow: hidden;
					img {
						max-width: 100%;
						height: 100%;
					}
				}
				.info {
					color: $lightfontcolor;
					font-size: 12px;
					.people {
						margin-right: 10px;
					}
				}
				.text {
					display: inline-block;
					position: relative;
					padding: 5px 10px;
					max-width: (calc(100% - 80px));
					font-size: 14px;
					text-align: left;
					word-break: break-all;
					background-color: $chatbg;
					@include border-radius(4px);
					&:before {
						content: " ";
						position: absolute;
						top: 4px;
						right: 100%;
						border: 6px solid transparent;
						border-right-color: $chatbg;
					}
					img {
						max-height: 100px;
						vertical-align: middle;
						cursor: pointer;
					}
				}
				&.self {
					text-align: right;
					.avatar {
						float: right;
						margin: 0 0 0 10px;
					}
					.text {
						background-color: $bgcolor;
						&:before {
							right: inherit;
							left: 100%;
							border-right-color: transparent;
							border-left-color: $bgcolor;
						}
					}
				}
			}
			.text-center {
				text-align: center;
				margin: 30px 0;
				position: relative;
				color: $lightfontcolor;
				&:before {
					content: " ";
					display: inline-block;
					width: 20%;
					height: 1px;
					border-top: 1px solid $lightfontcolor;
					position: absolute;
					top: 8px;
					left: 20%;
				}
				&:after {
					content: " ";
					display: inline-block;
					width: 20%;
					height: 1px;
					border-top: 1px solid $lightfontcolor;
					position: absolute;
					top: 8px;
					right: 20%;
				}
			}
		}
		.chat-send {
			width: 100%;
			height: 200px;
			border-top: 1px solid #dcdcdc;
			padding: 10px;
			background: #fff;
			position: relative;
			.toolkits {
				margin: 0 10px 10px;
				>ul>li {
					display: inline-block;
					margin-right: 26px;
					position: relative;
				}
				i {
					width: 24px;
					height: 24px;
					display: inline-block;
					cursor: pointer;
				}
				i.emoji {
					background: url("./assets/img/emoji.png") center no-repeat;
				}
				i.file {
					background: url("./assets/img/file-upload.png") center no-repeat;
				}
				i.pic {
					background: url("./assets/img/upload-pic.png") center no-repeat;
				}
				#uploadFile,
				#uploadImage {
					margin: 0;
					padding: 0;
					height: 30px;
					width: 30px;
					border: none;
					overflow: hidden;
					font-size: 10px;
					position: absolute;
					right: 0;
					top: 0;
					opacity: 0;
					filter: alpha(opacity=0);
					cursor: pointer;
				}
				.emoji-box {
					background-color: #fff;
					box-shadow: 0 2px 10px 0 rgba(0, 0, 0, .2);
					position: absolute;
					left: -10px;
					bottom: 55px;
					width: 420px;
					font-size: 0;
					z-index: 999;
					.tarng {
						background: url("./assets/img/trang-bottom.png") center no-repeat;
						width: 40px;
						height: 18px;
						display: inline-block;
						position: absolute;
						left: 3px;
					}
					.box-ul {
						height: 300px;
						overflow-y: auto;
						padding: 5px;
						li {
							width: 50px;
							height: 50px;
							float: left;
							text-align: center;
							span {
								font-size: 38px;
								cursor: pointer;
								vertical-align: middle;
								img {
									width: 40px;
									height: 40px;
								}
							}
						}
					}
					.emoji-list {
						width: 100%;
						height: 50px;
						border-top: 1px solid $bdcolor;
						padding: 10px;
						li {
							font-size: 20px;
							span {
								cursor: pointer;
							}
						}
					}
				}
			}
			#im-editor {
				font-family: "Microsoft YaHei";
				resize: none;
				padding: 0 10px;
				border: 0;
				width: 100%;
				height: 100px;
				font-size: 14px;
				overflow-y: auto;
			}
			.btns {
				text-align: right;
				.btn {
					padding: 5px 15px;
					text-align: center;
					color: $black;
					font-size: 14px;
					margin: 10px;
					border: 1px solid $bdcolor;
					min-width: 80px;
					display: inline-block;
					&.primary {
						color: #fff;
						background-color: $maincolor;
						border-color: $maincolor;
					}
				}
			}
		}
	}
	.info-box {
		width: 310px;
		height: 590px;
		float: right;
		border-left: 1px solid $bdcolor;
		position: relative;
		.info-tab {
			width: 100%;
			.el-tabs__header {
				margin: 0 0 10px;
			}
			.el-tabs__content {
				position: absolute;
				overflow-y: auto;
				bottom: 0;
				top: 52px;
				overflow-y: auto;
				width: 100%;
			}
			.el-tabs__item.is-active {
				color: $maincolor;
				background-color: #fff;
			}
			.el-tabs__active-bar {
				top: 0;
				background-color: $maincolor;
			}
			.el-tabs__item {
				background-color: $tabbg;
				display: table-cell;
				width: 1%;
				text-align: center;
			}
			.history {
				text-align: center;
				position: relative;
				color: $fontcolor;
				padding: 3px 10px;
				margin: 5px 0;
				z-index: 2;
				&:before {
					content: ' ';
					width: 100%;
					height: 1px;
					border-top: 1px solid $bdcolor;
					display: inline-block;
					position: absolute;
					left: 0;
					top: 11px;
					z-index: -1;
				}
				span {
					z-index: 999;
					background: #fff;
					padding: 0px 20px;
					display: inline-block;
				}
			}
			.recent-view {
				padding: 0 10px 10px;
				li:not(.history) {
					width: 100%;
					height: 90px;
					background-color: $bgcolor;
					position: relative;
					margin: 10px 0;
					.left {
						width: 70px;
						height: 70px;
						margin: 10px;
						margin-right: 10px;
						overflow: hidden;
						background: #fff;
						img {
							padding: 3px 5px;
							max-width: 100%;
							height: 100%;
						}
					}
					.info {
						padding: 10px;
						p {
							font-size: 14px;
							color: $fontcolor;
							@include text-overflow(2);
							height: 38px;
						}
						.product-price {
							position: absolute;
							bottom: 10px;
							font-size: 14px;
						}
						.btn {
							padding: 4px 13px;
							color: $fontcolor;
							background: #fff;
							border: 1px solid $bdcolor;
							position: absolute;
							right: 10px;
							bottom: 10px;
						}
						.status {
							color: #116DEA;
							font-size: 14px;
						}
						.date {
							color: $lightfontcolor;
							font-size: 14px;
						}
					}
				}
			}
			.order-searched {
				padding: 0 10px 10px;
				li:not(.history) {
					width: 100%;
					height: 90px;
					background-color: $bgcolor;
					position: relative;
					margin: 10px 0;
					.left {
						width: 70px;
						height: 70px;
						margin: 10px;
						margin-right: 10px;
						overflow: hidden;
						background: #fff;
						img {
							padding: 3px 5px;
							max-width: 100%;
							height: 100%;
						}
					}
					.info {
						padding: 10px;
						p {
							font-size: 14px;
							color: $fontcolor;
							@include text-overflow(1);
						}
						.order-id {
							color: $fontcolor;
							font-size: 14px;
						}
						.order-price {
							color: $darkfontcolor;
							font-size: 14px;
						}
						.status {
							color: #116DEA;
						}
						.date {
							color: $lightfontcolor;
							right: 10px;
						}
						.date,
						.status {
							font-size: 14px;
							position: absolute;
							bottom: 10px;
						}
					}
				}
			}
			.search-order {
				padding: 0 10px 10px;
				background: $bgcolor;
				.row {
					padding: 10px 20px 0;
					display: inline-block;
					width: 100%;
					span {
						width: 70px;
						font-size: 14px;
						color: $fontcolor;
					}
					select {
						border: 0;
						min-width: 150px;
						height: 30px;
						vertical-align: middle;
					}
					.btn {
						padding: 5px 15px;
						text-align: center;
						color: $black;
						font-size: 14px;
						margin: 10px;
						border: 1px solid $bdcolor;
						min-width: 80px;
						display: inline-block;
						&.primary {
							color: #fff;
							background-color: $maincolor;
							border-color: $maincolor;
						}
					}
				}
			}
			.common-problems {
				.el-collapse {
					border: 0;
				}
				.el-collapse-item__header__arrow {
					display: none;
				}
				.is-active {
					background-color: $bgcolor;
					.el-collapse-item__header {
						color: $maincolor;
						background-color: $bgcolor;
						margin: 0 10px;
						padding: 0;
						border-bottom: 1px solid #dcdcdc;
					}
					.el-collapse-item__wrap {
						background-color: $bgcolor;
						border-bottom: 0;
						.el-collapse-item__content {
							padding: 10px 15px 10px 35px;
							font-size: 12px;
							color: $lightfontcolor;
						}
					}
					.gci-info {
						width: 14px;
						height: 14px;
						display: inline-block;
						background: url("./assets/img/question-a.png") center no-repeat;
					}
				}
				.el-collapse-item__header {
					height: 30px;
					line-height: 30px;
					color: $fontcolor;
					font-size: 12px;
					border-bottom: 0;
					padding-left: 10px;
					@include text-overflow(1);
				}
				.gci-info {
					width: 14px;
					height: 14px;
					display: inline-block;
					background: url("./assets/img/question.png") center no-repeat;
					vertical-align: sub;
				}
				.see-more {
					margin: 25px 10px 10px;
					border-top: 1px solid #dcdcdc;
					text-align: center;
					.fz-10 {
						margin: 10px 0;
						font-size: 12.5px;
						-webkit-transform: scale(0.8);
						transform: scale(0.8);
						a {
							color: #116DEA;
						}
					}
					.app {
						width: 185px;
						height: 62px;
						margin: 0 auto;
						padding: 6px;
						background: $bgcolor;
						img {
							width: 50px;
							height: 50px;
							float: left;
						}
						p {
							color: $lightfontcolor;
							font-size: 12px;
						}
					}
				}
			}
		}
	}
}
</style>
