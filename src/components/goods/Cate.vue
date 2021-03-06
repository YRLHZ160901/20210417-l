<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格占位区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delet"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogclosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="AddCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKey"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateRef"
        label-width="100px"
      >
        <el-form-item label="修改分类" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类的数据列表，默认为空
      cateList: [],
      //总数据条数
      total: 0,
      //为table指定列定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示：将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "isOk",
        },
        {
          label: "排序",
          //表示：将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          //表示：将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "opt",
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        //父级分类的id
        cat_pid: 0,
        //分类的等级默认为：添加的是一级分类
        cat_level: 0,
      },
      //添加分类表单的验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //父级分类的列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true,
      },
      //选中的父级分类的id数组
      selectedKey: [],
      //控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 查询到的分类信息对象--编辑分类
      editCateForm: {},
      //编辑分类的雁阵规则对象
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      //   console.log(res.data);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展示添加分类按钮对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList();
      //在展示出对话框
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      // console.log(res.data);
      this.parentCateList = res.data;
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      console.log(this.selectedKey);
      // 如果selectedKey数组中的length大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKey.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKey[
          this.selectedKey.length - 1
        ];
        // 为当前分了的等级赋值
        this.addCateForm.cat_level = this.selectedKey.length;
        return;
      } else {
        //父级分类的id
        this.addCateForm.cat_pid = 0;
        // 为当前分了的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.AddCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //监听添加分类对话框的的关闭事件，重置表单数据
    addCateDialogclosed() {
      this.$refs.AddCateRef.resetFields();
      this.selectedKey = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //展示编辑分类的对话框-根据id查询相应的分类信息
    async showEditCateDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类信息失败");
      }
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    // 编辑修改分类信息并提交
    editCate() {
      this.$refs.editCateRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("编辑修改分类失败");
        }
        this.editCateDialogVisible = false;
        this.getCateList();
        this.$message.success("编辑修改分类成功");
      });
    },
    //根据分类id删除对应分类
    async removeCateById(cateId) {
      // console.log(cateId);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + cateId);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败");
      }
      this.$message.success("删除分类成功");
      this.getCateList();
    },
  },
};
</script>
<style lang='less' scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>