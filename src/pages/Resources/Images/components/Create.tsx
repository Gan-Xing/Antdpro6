import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import MapPicker from './MapPicker';
import { getAccessToken, formatToken } from '@/utils/auth';
import { useDictOptions } from '@/hooks/useDictOptions';
import React, { useState } from 'react';
import { useIntl } from '@umijs/max';
import { imageCategoryFallbackOptions } from '../constants';

interface CreateFormProps {
  createModalOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: Images.CreateParams) => Promise<boolean>;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mapLocation, setMapLocation] = useState<Images.LocationType>();
  const [locations, setLocations] = useState<Images.LocationType[]>([]);
  const [form] = Form.useForm();
  const intl = useIntl();
  const { options: imageCategoryOptions } = useDictOptions(
    'image.category',
    imageCategoryFallbackOptions,
  );

  const handleUpload = async ({ file, fileList }: any) => {
    const updatedFileList = fileList.map((f: UploadFile) => {
      if (f.uid === file.uid) {
        if (file.status === 'done' && file.response?.data?.data?.url) {
          // 如果返回中有 location，添加到位置列表中
          const location = file.response?.data?.data?.location;
          if (location) {
            setLocations((prev: Images.LocationType[]) => [...prev, location]); // 添加新位置到数组
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
        message.success(
          intl.formatMessage(
            {
              id: 'pages.resources.images.upload.success',
              defaultMessage: '{name} uploaded successfully',
            },
            {
              name: file.name,
            },
          ),
        );
      } else {
        message.warning(
          intl.formatMessage(
            {
              id: 'pages.resources.images.upload.error',
              defaultMessage: '{name} upload failed: {error}',
            },
            {
              name: file.name,
              error: intl.formatMessage({ id: 'pages.resources.images.upload.error.noUrl' }),
            },
          ),
        );
        console.warn('Upload response without URL:', file.response);
      }
    } else if (file.status === 'error') {
      message.error(
        intl.formatMessage(
          {
            id: 'pages.resources.images.upload.error',
            defaultMessage: '{name} upload failed: {error}',
          },
          {
            name: file.name,
            error:
              file.error?.message ||
              intl.formatMessage({ id: 'pages.resources.images.upload.error.unknown' }),
          },
        ),
      );
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
      <div style={{ marginTop: 8 }}>
        {intl.formatMessage({
          id: 'pages.resources.images.upload',
          defaultMessage: 'Upload',
        })}
      </div>
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
        message.error(
          intl.formatMessage(
            {
              id: 'pages.resources.images.upload.error.type',
              defaultMessage: '{name} is not an image file',
            },
            {
              name: file.name,
            },
          ),
        );
        return false;
      }
      return true;
    },
  };

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'pages.resources.images.create',
        defaultMessage: 'New Image',
      })}
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
          message.error(
            intl.formatMessage({
              id: 'pages.resources.images.upload.required',
              defaultMessage: 'Please upload at least one image',
            }),
          );
          return false;
        }

        const success = await props.onSubmit({
          ...values,
          photos,
          location: mapLocation,
        });

        if (success) {
          props.onCancel();
          form.resetFields();
          setFileList([]);
          setLocations([]);
          setMapLocation(undefined);
        }

        return success;
      }}
      layout="vertical"
    >
      <ProFormSelect
        name="area"
        label={intl.formatMessage({
          id: 'pages.resources.images.area',
          defaultMessage: 'Project Area',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.area.placeholder',
          defaultMessage: 'Please select project area',
        })}
        options={[
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.temporary' }),
            value: 'temporary',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_disposal' }),
            value: 'soil_disposal',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_filling' }),
            value: 'soil_filling',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_replacement' }),
            value: 'soil_replacement',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.subgrade' }),
            value: 'subgrade',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.gravel_base' }),
            value: 'gravel_base',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.asphalt_surface' }),
            value: 'asphalt_surface',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.demolition' }),
            value: 'demolition',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.structure' }),
            value: 'structure',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.traffic_sign' }),
            value: 'traffic_sign',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.environment' }),
            value: 'environment',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.public_facilities' }),
            value: 'public_facilities',
          },
        ]}
        initialValue="subgrade"
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="category"
        label={intl.formatMessage({
          id: 'pages.resources.images.category',
          defaultMessage: 'Category',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.category.placeholder',
          defaultMessage: 'Please select category',
        })}
        options={imageCategoryOptions}
        initialValue="progress"
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="tags"
        label={intl.formatMessage({
          id: 'pages.resources.images.tags',
          defaultMessage: 'Tags',
        })}
        mode="tags"
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.tags.placeholder',
          defaultMessage: 'Enter tags. Multiple tags are supported.',
        })}
        fieldProps={{
          tokenSeparators: [',', ' '],
        }}
      />
      <ProFormTextArea
        name="description"
        label={intl.formatMessage({
          id: 'pages.resources.images.description',
          defaultMessage: 'Description',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.description.required',
          defaultMessage: 'Please enter description',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.resources.images.description.required' }),
          },
        ]}
      />
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <ProFormText
            name="stakeNumber"
            label={intl.formatMessage({
              id: 'pages.resources.images.stakeNumber',
              defaultMessage: 'Stake Number',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.resources.images.stakeNumber.placeholder',
              defaultMessage: 'Please enter stake number',
            })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <ProFormText
            name="offset"
            label={intl.formatMessage({
              id: 'pages.resources.images.offset',
              defaultMessage: 'Offset',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.resources.images.offset.placeholder',
              defaultMessage: 'Please enter offset',
            })}
          />
        </div>
      </div>
      <Form.Item
        name="location"
        label={intl.formatMessage({
          id: 'pages.resources.images.location',
          defaultMessage: 'Location',
        })}
        tooltip={intl.formatMessage({
          id: 'pages.resources.images.location.tooltip',
          defaultMessage: 'Click the map to select a location, or click "Get Current Location".',
        })}
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
      <Form.Item
        label={intl.formatMessage({
          id: 'pages.resources.images.photos',
          defaultMessage: 'Photos',
        })}
        required
        tooltip={intl.formatMessage({
          id: 'pages.resources.images.photos.tooltip',
          defaultMessage: 'Supports jpg, png, gif, webp, and heic formats',
        })}
      >
        <Upload {...uploadProps}>{fileList.length >= 1 ? null : uploadButton}</Upload>
      </Form.Item>
    </ModalForm>
  );
};

export default CreateForm;
