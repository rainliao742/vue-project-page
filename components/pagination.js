export default {
  props: ["pages", "getProducts"],
  template: `
	<nav aria-label="Page navigation example">
		<ul class="pagination">
			<li class="page-item"
			:class= "{ disabled: !pages.has_pre }"
			><!--當已經到最前頁面時，加上不能按的Class-->
				<a class="page-link" href="#" aria-label="Previous"
				@click.prevent="getProducts(pages.current_page - 1)"
				>
					<span aria-hidden="true">&laquo;</span>
					<span class="sr-only"></span>
				</a>
			</li>
			<li class="page-item"
				:class= "{ active: page === pages.current_page }"
				v-for="page in pages.total_pages" :key="page + 'page'"
			><!--抓取頁碼資料-->
				<a class="page-link" href="#"
				@click.prevent="$emit('change-page', page)"
				>{{ page }}</a>
				<!--點擊切換到當前資料的頁面-->
				<!--props方法 @click.prevent="getProducts(page)"-->
			</li>
			<li class="page-item"
			:class= "{ disabled: !pages.has_next }"
			><!--當已經到最後頁面時，加上不能按的Class-->
				<a class="page-link" href="#" aria-label="Next"
				@click.prevent="getProducts(pages.current_page + 1)"
				>
					<span aria-hidden="true">&raquo;</span>
					<span class="sr-only"></span>
				</a>
			</li>
		</ul>
	</nav>
	`,
};