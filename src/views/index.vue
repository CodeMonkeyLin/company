<style scoped lang="less">
.search {
  width: 100%;
}
.searchItem {
  margin: 10px 10px !important;
  width: 500px;
  //   float: left;
}
</style>
<template>
    <div class="index">
        <div>
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
                <Cascader v-model="areaModel" change-on-select filterable :data="areaList" @on-change="SelectArea" placeholder="请选择城市或者省份（单选）"></Cascader>
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
        <Card>
            <p slot="title">总数 <span style="color:#2d8cf0;">{{total_item_count}}</span></p>
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
    export default {
        data () {
            return {
                searchParams: {
                    qualification_enterprise_list: [],
                    area_list: [],
                    page: 1 
                },
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
                        title: '企业名称',
                        key: 'company_name',
                        width: 300
                    },{
                        title: '法人',
                        key: 'legal_person',
                        width: 100
                    },{
                        title: '企业经营地址',
                        key: 'manage_address',
                    },{
                        title: '省份',
                        key: 'province_name',
                        width: 150
                    },{
                        title: '地级市',
                        key: 'city_name',
                        width: 150
                    },{
                        title: '企业注册属地',
                        key: 'reg_address',
                        width: 150
                    },{
                        title: '建筑资质',
                        key: 'qualification_enterprise',
                        render:(h,params)=>{
                            return h('div', {}, [h('div',{
                                style:{
                                    padding: '10px'
                                }
                            },[...new Set( params.row.qualification_enterprise.split(','))].map(item => {
                                        if(this.searchParams.qualification_enterprise || this.searchParams.qualification_enterprise_list.length){
                                            if(item.indexOf(this.searchParams.qualification_enterprise) >=0 || this.searchParams.qualification_enterprise_list.includes(item.trim())){
                                                return h('span', {
                                                    style: {
                                                        padding: '4px',
                                                        color: 'red',
                                                        listStyle:'none'
                                                    }
                                                }, item + ',')
                                            } 
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
                    }]
            }
        },
        created(){
            const that = this;
            this.getCompanyInfo();
            this.getArea();
            this.getQualification();
            this.$http.get('https://co-api.zhgcloud.com/area-list')
            .then(function (response) {
                that.remoteArealist = response.data.data.XCmdrResult;
                that.loading =  false;
            })
            .catch(function (error) {
                    console.log(error);
            });
            this.$http.get('http://127.0.0.1/qualification-list')
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
                this.$http.get('http://127.0.0.1/company-list', {
                    params:that.searchParams
                })
                .then(function (response) {
                    that.tableData = response.data.data.XCmdrResult.data_list;
                    that.total_page_count = response.data.data.XCmdrResult.total_page_count;
                    that.total_item_count = response.data.data.XCmdrResult.total_item_count;
                    console.log(that.total_page_count);
                    that.searchLoading = false;
                    that.tableLoading = false;
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getArea(){
                const that = this;
                this.$http.get('https://resources.zhgcloud.com/areas/web-tree')
                .then(function (response) {
                    that.areaList = response.data.XCmdrResult.map(item=>{
                        return {
                            value: item.value,
                            label: item.label,
                            children:item.children[0].children ? item.children.map(r=>{
                                return { value:r.value,label:r.label}
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
                this.$http.get('https://co-api.zhgcloud.com/company-qualification')
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
                if(selectedData.length){
                    this.searchParams.qualification_enterprise = selectedData[selectedData.length-1].label;
                }else{
                    this.searchParams.qualification_enterprise = '';
                }
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
            }
        }
    }
       
    
</script>
