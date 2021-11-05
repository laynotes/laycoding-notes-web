<template>
  <div>
    <!--  <a-collapse v-model="activeKey">
        <a-collapse-panel key="1" header="今日代办">
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item
                v-for="k in form.getFieldValue('keys')"
                :key="k"
                v-bind="formItemLayoutWithOutLabel"
                :required="false"
            >
              <a-input style="width: 60%; margin-right: 8px"
              />
              <a-icon
                  v-if="form.getFieldValue('keys').length > 1"
                  class="dynamic-delete-button"
                  type="minus-circle-o"
                  :disabled="form.getFieldValue('keys').length === 1"
                  @click="() => remove(k)"
              />
            </a-form-item>
            <a-form-item v-bind="formItemLayoutWithOutLabel">
              <a-button type="dashed" style="width: 60%" @click="add">
                <a-icon type="plus"/>
                新增代办
              </a-button>
            </a-form-item>
            <a-form-item v-bind="formItemLayoutWithOutLabel">
              <a-button type="primary" html-type="submit" v-if="false">
                保存
              </a-button>
            </a-form-item>
          </a-form>

          <a-icon slot="extra" type="schedule"  @click="()=>{this.$emit('showCalender',true)}"/>
        </a-collapse-panel>
      </a-collapse>

      <a-card title="代办事项" style="width: 420px">
        <a-icon slot="extra" type="schedule"  @click="()=>{this.$emit('showCalender',true)}"/>

      </a-card>
       -->
    <div class="todo-title">
      <div style="height: 100%;line-height: 100%;font-size: 18px;font-weight: bold">待办事项</div>
      <a-icon slot="extra" type="schedule" @click="()=>{this.$emit('showCalender',true)}"/>
    </div>
    <div class="todo-content">



      <div hoverable class="todo-list" >
        <draggable v-model="todoList"  chosenClass="chosen" forceFallback="true" group="people" animation="1000" @start="onStart" @end="onEnd">
          <transition-group>
            <div class="todo-item" v-for="item in todoList" :key="item.id" :style="item.complete ? 'background: #e6f7ff;' : ' background: #fff1f0;'">
              <div :class="item.complete ? 'todo-item-left' : 'todo-item-left-complete' ">
                <div class="todo-item-select">
                  <a-radio :checked="item.complete"/>
                </div>
                <div class="todo-item-content">
                  {{ item.title }}
                </div>
              </div>

              <div class="todo-item-right">
                <a-icon type="close-circle" v-if="item.complete" style="color: #1890ff"/>
                <a-icon type="check-circle" v-else style="color: #f5222d" />
              </div>
            </div>

          </transition-group>
        </draggable>

      </div>

      <a-card hoverable   style="display: none">
        <img
            slot="cover"
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
        <template slot="actions" class="ant-card-actions">
          <a-icon key="setting" type="setting" />
          <a-icon key="edit" type="edit" />
          <a-icon key="ellipsis" type="ellipsis" />
        </template>
        <a-card-meta title="Card title" description="This is the description">
          <a-avatar
              slot="avatar"
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          />
        </a-card-meta>
      </a-card>
    </div>

    <a-form :form="form" @submit="handleSubmit">
      <a-form-item
          v-for="k in form.getFieldValue('keys')"
          :key="k"
          v-bind="formItemLayoutWithOutLabel"
          :required="false"
      >
        <a-input style="width: 60%; margin-right: 8px"
        />
        <a-icon
            v-if="form.getFieldValue('keys').length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="form.getFieldValue('keys').length === 1"
            @click="() => remove(k)"
        />
      </a-form-item>
      <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="dashed" style="width: 60%" @click="add">
          <a-icon type="plus"/>
          新增代办
        </a-button>
      </a-form-item>
      <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="primary" html-type="submit" v-if="false">
          保存
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>

let id = 0;
import draggable from 'vuedraggable'
export default {
  //注册draggable组件
  components: {
    draggable,
  },
  name: 'lay-todo',
  data() {
    return {
      todoList: [
        {
          id: "1",
          title: "测试测试",
          desc: '',
          type: 0,
          complete: true
        },
        {
          id: "2",
          title: "测试测试",
          desc: '',
          type: 0,
          complete: false
        }
      ],
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`,
      activeKey: ['1'],
      formItemLayout: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 4},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 20},
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: {span: 24, offset: 0},
          sm: {span: 20, offset: 4},
        },
      },
      drag: false,
      myArray: [
        { people: 'cn', id: 1, name: 'www.itxst.com' },
        { people: 'cn', id: 2, name: 'www.baidu.com' },
        { people: 'cn', id: 3, name: 'www.taobao.com' },
        { people: 'us', id: 4, name: 'www.google.com' }
      ]
    };
  },
  watch: {
    activeKey(key) {
      console.log(key);
    },
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, {name: 'dynamic_form_item'});
    this.form.getFieldDecorator('keys', {initialValue: [], preserve: true});
  },
  methods: {
    onStart() {
      this.drag = true;
    },
    onEnd() {
      this.drag = false;

      console.log(this.todoList)
    },
    remove(k) {
      const {form} = this;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      // We need at least one passenger
      if (keys.length === 1) {
        return;
      }

      // can use data-binding to set
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    },

    add() {
      const {form} = this;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      // eslint-disable-next-line no-undef
      const nextKeys = keys.concat(id++);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        keys: nextKeys,
      });
    },

    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          const {keys, names} = values;
          console.log('Received values of form: ', values);
          console.log(
              'Merged values:',
              keys.map(key => names[key]),
          );
        }
      });
    },
  },
};
</script>
<style scoped>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}

.dynamic-delete-button:hover {
  color: #777;
}
.item {
  padding: 6px;
  background-color: #fdfdfd;
  border: solid 1px #eee;
  margin-bottom: 10px;
  cursor: move;
}
/*选中样式*/
.chosen {
  box-shadow: 0 0 4px #c0bebe;
}
.todo-title {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 10px 0;
  border-bottom: 1px #eee solid;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: auto 0;
}

.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.todo-list {
  margin-top: 10px;
}

.todo-item {
  width: 100%;
  height: 64px;
  line-height: 64px;
  box-shadow: 0 0 4px #eeeeee;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 5px;

  margin: 10px 0;
}

.todo-item-left {
  border-left: 10px #1890ff solid;
  padding-left: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
}
.todo-item-left-complete{
  border-left: 10px #f5222d solid;
  padding-left: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
}
.todo-item-content {
  padding-left: 10px;
  font-size: 16px;
  font-weight: bold;
}
.todo-item-right {
  margin-right: 10px;
  cursor: pointer;
}
</style>
