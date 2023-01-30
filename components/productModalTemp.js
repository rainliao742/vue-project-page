export default {
  props: ["tempProduct", "updateProduct"],
  template: `
		<div class="modal-dialog modal-xl">
			<div class="modal-content border-0">
				<div class="modal-header bg-dark text-white">
					<h5 id="productModalLabel" class="modal-title">
						<span>{{ isNew? '新增產品': '編輯產品' }}</span>
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="row">
						<div class="col-sm-4">
							<div class="mb-2">
								<div class="mb-3">
									<label for="imageUrl"
										class="form-label">輸入主圖片網址</label>
									<input type="text" class="form-control"
										placeholder="請輸入圖片連結" v-model="tempProduct.imageUrl"><!--綁定輸入圖片網址-->
								</div>
								<img class="img-fluid" :src="tempProduct.imageUrl" :alt="tempProduct.title"><!--顯示圖片-->
							</div>
							<!--多圖新增-->
							<h4 class="m-3">多圖新增</h4>
							<!--判斷是否 tempProduct.imagesUrl 為陣列(代表的是不是多圖)-->
							<div v-if="Array.isArray(tempProduct.imagesUrl)">
								<template v-for="(image, key) in tempProduct.imagesUrl" :key="key + 123456">
								<input type="text" class="form-control" v-model="tempProduct.imagesUrl[key]">
									<!--綁定tempProduct內的imagesUrl的陣列內的值，使用key來對照所陣列內的索引值-->
									<img :src="image" class="img-fluid mb-3">
								</template>
								<!--判斷新增跟刪除-->
								<div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
									<!--*如果沒有內容或最新的一筆有資料才可以做[新增]-->
									<button class="btn btn-outline-primary btn-sm d-block w-100" 
									@click="tempProduct.imagesUrl.push('')">
									新增圖片
								</button><!--新增一筆資料在temProduct內-->
							</div>
							<div v-else>
								<button class="btn btn-outline-danger btn-sm d-block w-100" 
									@click="tempProduct.imagesUrl.pop()">
								刪除圖片
							</button><!--刪除一筆資料在temProduct內-->
						</div>
					</div>


					<div v-else>
						<button class="btn btn-outline-primary btn-sm d-block w-100" @click="addImage">
						新增圖片
					</button>
				</div>
				<!--多圖新增-->
			</div>
			<div class="col-sm-8">
				<div class="mb-3">
					<label for="title" class="form-label">標題</label>
					<input id="title" type="text"
						class="form-control"
						placeholder="請輸入標題"
						v-model="tempProduct.title"
					>
				</div>

				<div class="row">
					<div class="mb-3 col-md-6">
						<label for="category"
							class="form-label">分類</label>
						<input id="category" type="text"
							class="form-control"
							placeholder="請輸入分類"
							v-model="tempProduct.category"
						>
					</div>
					<div class="mb-3 col-md-6">
						<label for="price"
							class="form-label">單位</label>
						<input id="unit" type="text"
							class="form-control"
							placeholder="請輸入單位"
							v-model="tempProduct.unit"
						>
					</div>
				</div>

				<div class="row">
					<div class="mb-3 col-md-6">
						<label for="origin_price"
							class="form-label">原價</label>
						<input id="origin_price" type="number"
							min="0" class="form-control"
							placeholder="請輸入原價"
							v-model.number="tempProduct.origin_price" 
									><!--帶入價格使用number-->
					</div>
					<div class="mb-3 col-md-6">
						<label for="price"
							class="form-label">售價</label>
						<input id="price" type="number" min="0"
							class="form-control"
							placeholder="請輸入售價"
							v-model.number="tempProduct.price"
									><!--帶入價格使用number-->
					</div>
				</div>
				<hr>

					<div class="mb-3">
						<label for="description"
							class="form-label">產品描述</label>
						<textarea id="description" type="text"
							class="form-control"
							placeholder="請輸入產品描述"
							v-model="tempProduct.description"
						>
						</textarea>
					</div>
					<div class="mb-3">
						<label for="content"
							class="form-label">說明內容</label>
						<textarea id="description" type="text"
							class="form-control"
							placeholder="請輸入說明內容"
							v-model="tempProduct.content"
						>
						</textarea>
					</div>
					<div class="mb-3">
						<div class="form-check">
							<input id="is_enabled"
								class="form-check-input"
								type="checkbox" :true-value="1"
							:false-value="0"
							v-model="tempProduct.is_enabled"
									>
							<label class="form-check-label"
								for="is_enabled">是否啟用</label>
						</div>
					</div>
			</div>
		</div>
			</div >
			<div class="modal-footer">
				<button type="button" class="btn btn-outline-secondary"
					data-bs-dismiss="modal">
					取消
				</button>
				<button type="button" class="btn btn-primary"
				@click="updateProduct"
				>
				確認
			</button>
			</div >
		</div >
	</div >
	`,
};