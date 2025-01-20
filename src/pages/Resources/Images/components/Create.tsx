import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import MapPicker from './MapPicker';
import { getAccessToken, formatToken } from '@/utils/auth';
import React, { useState } from 'react';

interface CreateFormProps {
  createModalOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: Images.CreateParams) => Promise<boolean>;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mapLocation, setMapLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [locations, setLocations] = useState<{ latitude: number; longitude: number }[]>([]);
  const [form] = Form.useForm();

  const handleUpload = async ({ file, fileList }: any) => {
    const updatedFileList = fileList.map((f: UploadFile) => {
      if (f.uid === file.uid) {
        if (file.status === 'done' && file.response?.data?.data?.url) {
          // 如果返回中有 location，添加到位置列表中
          const location = file.response?.data?.data?.location;
          if (location) {
            setLocations((prev: { latitude: number; longitude: number }[]) => [...prev, location]); // 添加新位置到数组
            // 如果还没有手动选择位置，则设置第一个位置为地图位置
            if (!mapLocation) {
              setMapLocation(location);
              form.setFieldsValue({ location });
            }
          }
          return {
            ...f,
            status: file.status,
            response: file.response,
            url: file.response.data.data.url,
            thumbUrl: file.response.data.data.url,
          };
        }
        return { ...f, status: file.status, response: file.response };
      }
      return f;
    });

    if (file.status === 'uploading') {
      console.log('Uploading:', file, fileList);
    }

    setFileList(updatedFileList);

    if (file.status === 'done') {
      const url = file.response?.data?.data?.url;
      if (url) {
        message.success(`${file.name} 上传成功`);
      } else {
        message.warning(`${file.name} 上传成功，但未获取到URL`);
        console.warn('Upload response without URL:', file.response);
      }
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败: ${file.error?.message || '未知错误'}`);
      console.error('Upload error:', file.error);
    }
  };

  // 处理文件删除，同时删除对应的位置
  const handleRemove = (file: UploadFile) => {
    const index = fileList.findIndex((f: UploadFile) => f.uid === file.uid);
    if (index > -1) {
      const newLocations = [...locations];
      newLocations.splice(index, 1);
      setLocations(newLocations);
    }
    return true;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/images/upload',
    headers: {
      Authorization: formatToken(getAccessToken()),
    },
    onChange: handleUpload,
    onRemove: handleRemove,
    multiple: false,
    maxCount: 1,
    listType: 'picture-card',
    fileList: fileList,
    accept: 'image/*,.heic',
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic');
      if (!isImage) {
        message.error(`${file.name} 不是图片文件`);
        return false;
      }
      return true;
    },
  };

  return (
    <ModalForm
      title="新建图片"
      width={800}
      form={form}
      open={props.createModalOpen}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setFileList([]);
          setLocations([]); // 重置位置列表
          setMapLocation(undefined); // 重置地图位置
          props.onCancel();
        }
      }}
      onFinish={async (values) => {
        const photos = fileList
          .filter((file) => file.status === 'done')
          .map((file) => file.response?.data?.data?.path)
          .filter(Boolean);

        if (photos.length === 0) {
          message.error('请至少上传一张图片');
          return false;
        }

        const success = await props.onSubmit({
          ...values,
          photos,
          location: mapLocation, // 提交手动选择的位置或最后一个有效的图片位置
        });

        if (success) {
          props.onCancel();
          form.resetFields();
          setFileList([]);
          setLocations([]); // 重置位置列表
          setMapLocation(undefined); // 重置地图位置
        }

        return success;
      }}
    >
      <ProFormSelect
        name="category"
        label="分类"
        options={[
          { label: '进度', value: '进度' },
          { label: '安全', value: '安全' },
          { label: '质量', value: '质量' },
        ]}
        placeholder="请选择分类"
        rules={[{ required: true, message: '请选择分类' }]}
        initialValue="进度" // 设置默认值
      />
      <ProFormSelect
        name="area"
        label="工程类别"
        options={[
          { label: '临建', value: '临建' },
          { label: '挖方弃方', value: '挖方弃方' },
          { label: '土方填方', value: '土方填方' },
          { label: '土方换填', value: '土方换填' },
          { label: '底基层', value: '底基层' },
          { label: '碎石基层', value: '碎石基层' },
          { label: '沥青面层', value: '沥青面层' },
          { label: '拆迁', value: '拆迁' },
          { label: '结构物', value: '结构物' },
          { label: '交通标志', value: '交通标志' },
          { label: '环境与绿化', value: '环境与绿化' },
          { label: '公共设施', value: '公共设施' },
        ]}
        placeholder="请选择工程类别"
        rules={[{ required: true, message: '请选择工程类别' }]}
        initialValue="底基层" // 设置默认值
      />
      <ProFormSelect
        name="tags"
        label="标签"
        mode="tags"
        placeholder="请输入标签（支持多个标签）"
        fieldProps={{
          tokenSeparators: [',', ' '],
        }}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
        rules={[{ required: true, message: '请输入描述' }]}
      />
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <ProFormText name="stakeNumber" label="桩号" placeholder="请输入桩号" />
        </div>
        <div style={{ flex: 1 }}>
          <ProFormText name="offset" label="偏距" placeholder="请输入偏距" />
        </div>
      </div>
      <Form.Item
        name="location"
        label="位置"
        tooltip={'点击地图选择位置，或点击"获取当前位置"按钮'}
      >
        <MapPicker
          value={mapLocation}
          locations={locations}
          onChange={(location) => {
            setMapLocation(location);
            form.setFieldsValue({ location });
          }}
        />
      </Form.Item>
      <Form.Item label="照片" required tooltip="支持 jpg、png、gif、webp、heic 格式">
        <Upload {...uploadProps}>{fileList.length >= 1 ? null : uploadButton}</Upload>
      </Form.Item>
    </ModalForm>
  );
};

export default CreateForm;
