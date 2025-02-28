import { getById } from '@/services/ant-design-pro/inquiry';

import { useParams } from 'umi';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  List,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Menu,
  Table,
  Modal,
  Form,
  Radio,
  Input,
  Tag,
} from 'antd';
import styles from './style.less';
import OperationModal from './components/OperationModal';
import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

type InquiryItem = {
  id: string;
  name: string;
  link: string;
  tag?: string;
  goodsSn?: string;
};

const ListContent = ({ data: { name, link, tag, goodsSn } }: { data: InquiryItem }) => (
  <div className={styles.listContent}>
    <div className={styles.listContentItem}>
      <p>{name}</p>
    </div>
    <div className={styles.listContentItem}>
      <p>{link}</p>
    </div>
    <div className={styles.listContentItem}>{tag}</div>
  </div>
);

const DetailPage: FC = () => {
  const [inqueryDetail, setInqueryDetail] = useState<API.InquiryDetail>();
  const [done, setDone] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<Partial<InquiryItem> | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('1');
  const [form] = Form.useForm();
  const tagEnumMap = {
    '0': { text: '', color: '' },
    '1': { text: 'RTS', color: 'green' },
    '2': { text: 'Similar', color: 'blue' },
    '3': { text: 'WFP', color: 'red' },
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showEditModal = (item: InquiryItem) => {
    setVisible(true);
    setCurrent(item);
  };

  const handleDone = () => {
    setDone(false);
    setVisible(false);
    setCurrent({});
  };

  const handleSubmit = (values: InquiryItem) => {
    setDone(true);
    const method = values?.id ? 'update' : 'add';
    //postRun(method, values);
  };

  const params = useParams();

  useEffect(() => {
    console.log(params);
    getById(params.name).then((x) => setInqueryDetail(x));
  }, []);

  const MoreBtn: React.FC<{
    item: InquiryItem;
  }> = ({ item }) => (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="edit">编辑</Menu.Item>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined />
      </a>
    </Dropdown>
  );

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'goodsName',
    },
    {
      title: '商品链接',
      dataIndex: 'link',
    },
    {
      title: '关联供货SN',
      dataIndex: 'goodsSn',
    },
    {
      title: '关联标记',
      dataIndex: 'relationType',
      render(text, record) {
        if (text == 0) {
          return;
        }
        return (
          <Tag color={tagEnumMap[text].color} key={record.recId}>
            {tagEnumMap[text].text}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      width: '150px',
      render(text, record) {
        return (
          <>
            <a
              key="edit"
              onClick={(e) => {
                e.preventDefault();
                showModal();
              }}
            >
              关联商品
            </a>
            <Divider type="vertical" />
            <MoreBtn key="more" item={record} />
          </>
        );
      },
    },
  ];

  const handleOk = () => {
    setIsModalOpen(false);

    console.log(form);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageContainer>
        <Card bordered={false}>
          <Descriptions title={'单号：' + inqueryDetail?.enquiryOrderSn}>
            <Descriptions.Item label="客户信息">{inqueryDetail?.customerInfo}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {moment(inqueryDetail?.gmtCreated * 1000).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ marginBottom: 32 }} />

          <Table rowKey="recId" dataSource={inqueryDetail?.orderGoodsList} columns={columns} />
        </Card>
      </PageContainer>
      <Button
        type="dashed"
        onClick={() => {
          setVisible(true);
        }}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <PlusOutlined />
        添加
      </Button>
      <OperationModal
        done={done}
        visible={visible}
        current={current}
        onDone={handleDone}
        onSubmit={handleSubmit}
      />
      <Modal title="关联商品" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ relationTypeValue: relationType }}
          onValuesChange={({ relationTypeValue }) => {
            setRelationType(relationTypeValue);
          }}
          requiredMark={true}
        >
          <Form.Item
            label="标记"
            name="relationType"
            required
            tooltip={{ title: '选择一种关联标记', icon: <InfoCircleOutlined /> }}
          >
            <Radio.Group>
              <Radio.Button value="1" defaultChecked={true}>
                RTS
              </Radio.Button>
              <Radio.Button value="2">Similar</Radio.Button>
              <Radio.Button value="3">WFP</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="商品SN" required={relationType != '3'} name="goodsSn">
            <Input placeholder="填写商品库中的商品SN" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetailPage;
