<style scoped lang="less">
.search {
  width: 100%;
}
.searchItem {
  margin: 10px 10px !important;
  width: 500px;
}
</style>
<template>
    <div class="index">
        <div>
            <div class="searchItem">
                <Select v-model="areaModel" @on-change="SelectArea" placeholder="请选择省份">
                    <Option v-for="item in areaList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <div class="searchItem">
                <Input search v-model="searchParams.search_text" enter-button="搜 索" @on-change="ChangeSearchText" label-in-value @on-search="SearchText" placeholder="请输入工程名称或者公司名称" class="search" />
            </div>
            <div class="searchItem">
                <Button type="primary" @click="Search" :loading="searchLoading">搜索</Button>
                <Button @click="resetParams">重置</Button>
            </div>
        </div>
        <Card>
            <div slot="title" style="height:32px;lineHeight:32px;">总数
                <span style="color:#2d8cf0;">{{total_item_count}}</span>
                <Button style="float:right;" @click="exportExcel">
                    导出表格
                </Button>
            </div>
            <Table :data="tableData" :columns="tableColumns" stripe :loading="tableLoading"></Table>
            <div style="margin: 10px;overflow: hidden">
                <div style="float: right;">
                    <Page :total="total_item_count" :page-size="current_per_page" :current="searchParams.page" @on-change="changePage"></Page>
                </div>
            </div>
        </Card>
    </div>
</template>
<script>
    import { apiHost } from '../apiHost.js';
    import { urlencode } from '../utils/urlencode.js';
    export default {
        data () {
            return {
                searchParams: {
                    qualification_enterprise_list: [],
                    area_list: [],
                    page: 1 
                },
                exportExcelUrl: `${apiHost.CO_HOST}/excel/export/companyImportant`,
                tableData: [],
                loading: true,
                searchLoading: false,
                tableLoading: true,
                options: [],
                total_page_count: 0,
                total_item_count: 0,
                current_per_page: 10,
                areaList: [],
                areaModel: [],
                tableColumns: [
                    {
                        title: '序号',
                        width: 80,
                        render: (h,params)=>{
                            return h('span',params.index + 1 + (this._data.searchParams.page - 1) * 10)
                        }
                    },
                   {
                        title: '工程名称',
                        // key: 'project_name',
                        render: (h,params)=>{
                            return h('a',{
                                attrs:{
                                    "href": params.row.detail_link,
                                    "target": "_blank"
                                }
                            },params.row.project_name)
                        }
                    },
                    {
                        title: '省份',
                        width: 80,
                        key: 'province_name'
                    },
                    {
                        title: '来源平台',
                        width: 200,
                        key: 'source_platform'
                    },
                    {
                        title: '行业',
                        width: 150,
                        key: 'industry'
                    },
                    {
                        title: '中标相关公司',
                        // width: 800,
                        render(h,params){
                            return h('div',
                                        {
                                            padding: "10px"        
                                        },
                                        [h('div',{
                                            style:{
                                                padding: '10px'
                                            }
                                        },[params.row.company_important.map(item => h('span', 
                                                {
                                                    style: {
                                                        textAlign: 'left',
                                                        padding: '5px'
                                                    },
                                                },
                                            item.company_name + ","))
                                        ]
                                    )
                                ]
                            )
                        }
                    },{
                        title: '日期',
                        key: 'date',
                        width: 150
                    }
                ]
            }
        },
        created(){
            const that = this;
            this.getCompanyImportantInfo();
            this.getArea();
        },
        methods: {
            changePage (page) {
                this.tableLoading = true;
                this.searchParams.page = page;
                this.getCompanyImportantInfo();  
            },
            getCompanyImportantInfo(){
                const that = this;
                this.$http.get(`${apiHost.CO_HOST}/company-important-list`, {
                    params:that.searchParams
                })
                .then(function (response) {
                    that.tableData = response.data.data.XCmdrResult.data_list;
                    that.total_page_count = response.data.data.XCmdrResult.total_page_count;
                    that.total_item_count = response.data.data.XCmdrResult.total_item_count;
                    that.searchLoading = false;
                    that.tableLoading = false;
                    that.exportExcelUrl = `${apiHost.CO_HOST}/excel/export/companyImportant?${urlencode(that.searchParams)}`;
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getArea(){
                const that = this;
                this.$http.get(`${apiHost.RESOURCES_HOST}/areas/web-tree`)
                .then(function (response) {
                    that.areaList = response.data.XCmdrResult.map(item=>{
                        return {
                            value: item.label,
                            label: item.label,
                        }
                    }) || [];
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            SelectArea(value){
                this.searchParams.area = value;
            },
            ChangeSearchText(e) {
                this.searchParams.search_text = e.target.value;
            },
            SearchText (value) {
                this.tableLoading = true;
                this.searchParams.search_text = value;
                this.searchParams.page = 1;
                this.getCompanyImportantInfo();
            },
            Search(){
                this.searchLoading = true;
                this.tableLoading = true;
                this.searchParams.page = 1;
                this.getCompanyImportantInfo();
            },
            resetParams(){
                this.tableLoading = true;
                this.searchParams = {
                    qualification_enterprise_list: [],
                    page: 1
                };
                this.qualificationModel = [];
                this.areaModel = [];
                this.getCompanyImportantInfo();
            },
            exportExcel(){
                if(this.total_item_count > 5000){
                    this.$Modal.warning({
                        title:'提示信息',
                        content:'表格条目超过5000导出表格过慢，请增加具体筛选条件！'
                    });
                    return;
                }
                window.open(this.exportExcelUrl);
            }
        }
    }
       
    
</script>
