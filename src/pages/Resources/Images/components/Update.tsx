import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { message, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';
import { getAccessToken, formatToken } from '@/utils/auth';
import MapPicker from './MapPicker';
import { Form } from 'antd';

interface UpdateFormProps {
  updateModalOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: Images.UpdateParams) => Promise<boolean>;
  values: Partial<Images.Entity>;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mapLocation, setMapLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.updateModalOpen && props.values) {
      form.setFieldsValue({
        ...props.values,
      });

      // 设置地图位置
      if (props.values.location) {
        try {
          // 如果 location 是字符串，尝试解析它
          const locationData =
            typeof props.values.location === 'string'
              ? JSON.parse(props.values.location)
              : props.values.location;

          setMapLocation(locationData);
          form.setFieldsValue({ location: locationData });
        } catch (error) {
          console.error('Failed to parse location data:', error);
        }
      } else {
        console.log('No location data provided');
      }
      // 如果有照片，初始化文件列表
      if (props.values.photos) {
        setFileList(
          props.values.photos.map((url, index) => ({
            uid: `-${index}`,
            name: url.split('/').pop() || `image-${index}`,
            status: 'done',
            url,
            response: { data: { data: { url } } },
          })),
        );
      }
    }
  }, [props.updateModalOpen, props.values, form]);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async ({ file, fileList }) => {
    const updatedFileList = fileList.map((f: UploadFile) => {
      if (f.uid === file.uid) {
        if (file.status === 'done' && file.response?.data?.data?.url) {
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

    setFileList(updatedFileList);

    if (file.status === 'uploading') {
      console.log('Uploading:', file, fileList);
    } else if (file.status === 'done') {
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

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/images/upload',
    headers: {
      Authorization: formatToken(getAccessToken()),
    },
    onChange: handleUpload,
    multiple: true,
    listType: 'picture-card',
    fileList,
    accept: 'image/*,.heic',
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic');
      if (!isImage) {
        message.error(`${file.name} 不是图片文件`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <ModalForm
      title="编辑图片"
      width={800}
      form={form}
      open={props.updateModalOpen}
      onOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue({
            ...props.values,
            location: props.values.location,
          });
        } else {
          form.resetFields();
          setFileList([]);
          props.onCancel();
        }
      }}
      onFinish={async (values) => {
        const photos = fileList
          .filter((file) => file.status === 'done')
          .map((file) => file.response?.data?.data?.url)
          .filter(Boolean) as string[];

        if (photos.length === 0) {
          message.error('请至少上传一张图片');
          return false;
        }

        const success = await props.onSubmit({
          id: props.values.id!,
          ...values,
          photos,
        });

        if (success) {
          props.onCancel();
          form.resetFields();
          setFileList([]);
        }
        return success;
      }}
    >
      {/* 分类 */}
      <ProFormSelect
        name="category"
        label="分类"
        options={[
          { label: '安全', value: '安全' },
          { label: '质量', value: '质量' },
          { label: '进度', value: '进度' },
        ]}
        placeholder="请选择分类"
        rules={[{ required: true, message: '请选择分类' }]}
      />

      {/* 工程类别，与创建页面一致 */}
      <ProFormSelect
        name="area"
        label="工程类别"
        options={[
          { label: '临建', value: '临建' },
          { label: '土方弃方', value: '土方弃方' },
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
      />

      {/* 标签 */}
      <ProFormSelect
        name="tags"
        label="标签"
        mode="tags"
        placeholder="请输入标签（支持多个标签）"
        fieldProps={{
          tokenSeparators: [',', ' '], // 支持用逗号或空格分隔标签
        }}
      />

      {/* 描述 */}
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
        rules={[{ required: true, message: '请输入描述' }]}
      />

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <ProFormText
          name="stakeNumber"
          label="桩号"
          placeholder="请输入桩号"
          fieldProps={{
            style: { width: '100%' },
          }}
        />
        <ProFormText
          name="offset"
          label="偏距"
          placeholder="请输入偏距"
          fieldProps={{
            style: { width: '100%' },
          }}
        />
      </div>

      <Form.Item
        name="location"
        label="位置"
        tooltip={'点击地图选择位置，或点击"获取当前位置"按钮'}
      >
        <MapPicker
          value={mapLocation}
          onChange={(location) => {
            setMapLocation(location);
            form.setFieldsValue({ location });
          }}
        />
      </Form.Item>

      <Form.Item label="照片" required tooltip="支持 jpg、png、gif、webp、heic 格式">
        <Upload {...uploadProps}>{fileList.length >= 8 ? null : uploadButton}</Upload>
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
