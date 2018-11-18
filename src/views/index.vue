<style scoped lang="less">
.search {
  width: 100%;
}
.searchItem {
  margin: 10px 10px !important;
  width: 500px;
}
.companyImportant {
  position: fixed;
  font-size: 20px;
  right: 250px;
  top: 10px;
}
</style>
<template>
    <div class="index">
        <div class="left">
            <div class="searchItem">
                <Input search v-model="searchParams.search_text" enter-button="搜 索" @on-change="ChangeSearchText" label-in-value @on-search="SearchText" placeholder="请输入企业名称、法人或经营地址" class="search" />
            </div>
            <div class="searchItem">
                <Cascader v-model="qualificationModel" :data="qualificationList" @on-change="SelectQualificationEnterprise" placeholder="请选择建筑资质"></Cascader>
            </div>
            <div class="searchItem">
                <Select v-model="searchParams.qualification_enterprise_list" multiple filterable remote :remote-method="remoteQualifitionList" @on-change="SearchQualifitionList" :loading="qualificationLoading" placeholder="请输入建筑资质（可多选）">
                    <Option v-for="(option, index) in qualificationOptions" :value="option.value" :key="index">{{option.label}}</Option>
                </Select>
            </div>
            <div class="searchItem">
                <Cascader v-model="areaModel" change-on-select :data="areaList" @on-change="SelectArea" placeholder="请选择城市或者省份（单选）"></Cascader>
            </div>
            <div class="searchItem">
                <Select v-model="searchParams.area_list" multiple filterable remote :remote-method="remoteMethod" @on-change="SearchArea" :loading="loading" placeholder="请输入城市或者省份（可多选）">
                    <Option v-for="(option, index) in options" :value="option.value" :key="index">{{option.label}}</Option>
                </Select>
            </div>
            <div class="searchItem">
                <Button type="primary" @click="Search" :loading="searchLoading">搜索</Button>
                <Button @click="resetParams">重置</Button>
            </div>
        </div>
        <a class="companyImportant" href="/companyImportant" target="_blank">查看重点企业中标信息</a>
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
                exportExcelUrl: `${apiHost.CO_HOST}/excel/export`,
                tableData: [],
                loading: true,
                searchLoading: false,
                tableLoading: true,
                qualificationLoading: true,
                options: [],
                total_page_count: 0,
                total_item_count: 0,
                current_per_page: 10,
                remoteArealist: [],
                qualificationList: [],
                qualifitcationAllList: [],
                areaList: [],
                qualificationOptions: [],
                qualificationModel: [],
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
                        title: '企业名称',
                        key: 'company_name',
                        width: 200
                    },{
                        title: '法人',
                        key: 'legal_person',
                        width: 80
                    },{
                        title: '企业经营地址',
                        key: 'manage_address',
                        width: 250
                    },{
                        title: '省份',
                        key: 'province_name',
                        width: 80
                    },{
                        title: '地级市',
                        key: 'city_name',
                        width: 100
                    },{
                        title: '企业注册属地',
                        key: 'reg_address',
                        width: 80
                    },{
                        title: '建筑资质',
                        key: 'qualification_enterprise',
                        render:(h,params)=>{
                            return h('div', {}, [h('div',{
                                style:{
                                    padding: '10px'
                                }
                            },[...new Set( params.row.qualification_enterprise.split(','))].map(item => {
                                        if(this.searchParams.qualification_enterprise_list.length && this.searchParams.qualification_enterprise_list.includes(item.trim())){
                                            return h('span', {
                                                style: {
                                                    padding: '4px',
                                                    color: 'red',
                                                    listStyle:'none'
                                                }
                                            }, item + ',')
                                        }
                                        if(this.searchParams.qualification_enterprise && item.indexOf(this.searchParams.qualification_enterprise) >=0 ){
                                            return h('span', {
                                                style: {
                                                    padding: '4px',
                                                    color: 'red',
                                                    listStyle:'none'
                                                }
                                            }, item + ',')
                                        }       
                                        return h('span', {
                                            style: {
                                                padding: '4px',
                                                listStyle:'none'
                                            }
                                        }, item ? item + ',' : item)
                                    }))
                                ])
                        }
                    },{
                        title: '招标信息',
                        key: 'project_info',
                        width: 150,
                        render:(h,params)=>{
                            if(params.row.project_info.length){
                                return h('span', {
                                                style: {
                                                    padding: '4px',
                                                    color: '#2d8cf0',
                                                    cursor: 'pointer'
                                                },
                                                on: {
                                                    click: () => {
                                                        window.open(`/bidding/${params.row.id}`)
                                                    }
                                                }
                                        }, '查看招标详情')
                            }else{
                                return h('span', {
                                                style: {
                                                    padding: '4px',
                                                    color: "gray",
                                                },
                                        }, '暂无招标信息')
                            }
                        }
                    }]
            }
        },
        created(){
            const that = this;
            this.getCompanyInfo();
            this.getArea();
            this.getQualification();
            this.$http.get(`${apiHost.CO_HOST}/area-list`)
            .then(function (response) {
                that.remoteArealist = response.data.data.XCmdrResult;
                that.loading =  false;
            })
            .catch(function (error) {
                    console.log(error);
            });
            this.$http.get(`${apiHost.CO_HOST}/qualification-list`)
            .then(function (response) {
                that.qualifitcationAllList = response.data.data.XCmdrResult;
                that.qualificationLoading =  false;
                })
            .catch(function (error) {
                    console.log(error);
            });
        },
        methods: {
            changePage (page) {
                this.tableLoading = true;
                this.searchParams.page = page;
                this.getCompanyInfo();  
            },
            getCompanyInfo(){
                const that = this;
                this.$http.get(`${apiHost.CO_HOST}/company-list`, {
                    params:that.searchParams
                })
                .then(function (response) {
                    that.tableData = response.data.data.XCmdrResult.data_list;
                    that.total_page_count = response.data.data.XCmdrResult.total_page_count;
                    that.total_item_count = response.data.data.XCmdrResult.total_item_count;
                    that.searchLoading = false;
                    that.tableLoading = false;
                    that.exportExcelUrl = `${apiHost.CO_HOST}/excel/export?${urlencode(that.searchParams)}`;
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
                            children:item.children[0].children ? item.children.map(r=>{
                                return { value:r.label,label:r.label}
                            }): []
                        }
                    }) || [];
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getQualification(){
                const that = this;
                this.$http.get(`${apiHost.CO_HOST}/company-qualification`)
                .then(function (response) {
                    that.qualificationList = response.data.data.XCmdrResult;
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            ChangeSearchText(e) {
                this.searchParams.search_text = e.target.value;
            },
            SearchText (value) {
                this.tableLoading = true;
                this.searchParams.search_text = value;
                this.searchParams.page = 1;
                this.getCompanyInfo();
            },
            SelectArea(value,selectedData){
                this.areaModel = value;
                if(selectedData.length){
                    this.searchParams.area = selectedData[selectedData.length-1].label;
                }else{
                    this.searchParams.area = '';
                }   
            },
            SearchArea(value){
                 this.searchParams.area_list = value;
            },
            SelectQualificationEnterprise(value,selectedData){
                this.qualificationModel = value;
                if(selectedData.length){
                    this.searchParams.qualification_enterprise = selectedData[selectedData.length-1].label;
                }else{
                    this.searchParams.qualification_enterprise = '';
                }
                console.log(this.searchParams.qualification_enterprise)
            },
            SearchQualifitionList(value){
                this.searchParams.qualification_enterprise_list = value; 
            },
            Search(){
                this.searchLoading = true;
                this.tableLoading = true;
                this.searchParams.page = 1;
                this.getCompanyInfo();
            },
            remoteMethod(query){
                const that = this; 
                if (query !== '') {
                    // this.loading = true;     
                    setTimeout(()=>{
                        const list = that.remoteArealist.map(item => {
                            return {
                                value: item,
                                label: item
                            };
                        });  
                        that.options = list.filter(item => item.label.indexOf(query) >= 0)
                    },200)
                } else {
                    this.options = [];
                }
            },
            remoteQualifitionList(query){
                const that = this; 
                if (query !== '') {   
                    setTimeout(()=>{
                        const list = that.qualifitcationAllList.map(item => {
                            return {
                                value: item.qualification_enterprise,
                                label: item.qualification_enterprise
                            };
                        });  
                        that.qualificationOptions = list.filter(item => item.label.indexOf(query) >= 0);
                    },200)
                } else {
                    this.qualificationOptions = [];
                }
            },
            resetParams(){
                this.tableLoading = true;
                this.searchParams = {
                    qualification_enterprise_list: [],
                    page: 1
                };
                this.qualificationModel = [];
                this.areaModel = [];
                this.getCompanyInfo();
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
